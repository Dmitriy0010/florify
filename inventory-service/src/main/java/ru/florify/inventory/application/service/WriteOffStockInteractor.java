package ru.florify.inventory.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.exception.NotFoundException;
import ru.florify.inventory.application.command.WriteOffCommand;
import ru.florify.inventory.application.port.in.WriteOffStockUseCase;
import ru.florify.inventory.application.port.out.*;
import ru.florify.inventory.domain.event.StockWrittenOffEvent;
import ru.florify.common.exception.InsufficientStockException;
import ru.florify.inventory.domain.model.StockBalance;
import ru.florify.inventory.domain.model.StockBatch;
import ru.florify.inventory.domain.model.StockTransaction;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WriteOffStockInteractor implements WriteOffStockUseCase {

    private final StockBalanceLookupPort balanceLookup;
    private final StockBalancePersistPort balancePersist;
    private final StockBatchRepository stockBatchRepository;
    private final StockTransactionPort transactionPort;
    private final EventPublisher eventPublisher;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final Clock clock;

    @Override
    @Transactional
    @Retryable(
            maxAttempts = 3,
            retryFor = ObjectOptimisticLockingFailureException.class,
            backoff = @Backoff(delay = 100, multiplier = 2)
    )
    public BigDecimal execute(WriteOffCommand command) {
        String sourceDocId = command.sourceDocumentId();
        if (sourceDocId == null || sourceDocId.isBlank()) {
            sourceDocId = "WO-" + java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")
                    .withZone(java.time.ZoneId.systemDefault())
                    .format(clock.instant()) + "-" + UUID.randomUUID().toString().substring(0, 4);
        }

        log.info("Processing FIFO write-off for productId: {} in store: {}, qty: {}, doc: {}", 
                command.productId(), command.storeId(), command.quantity(), sourceDocId);

        // 1. Idempotency Check - scoped to sourceDocument + productId
        // This allows one document (like a daily report) to contain multiple products
        if (transactionPort.existsBySourceDocumentAndProductId(sourceDocId, command.productId())) {
            log.warn("Idempotency skip: sourceDocument {} for product {} already processed", 
                    sourceDocId, command.productId());
            return BigDecimal.ZERO; 
        }

        // 2. FIFO: Fetch available batches within the SPECIFIC STORE sorted by arrival time
        List<StockBatch> batches = stockBatchRepository.findAvailableByProductIdAndStoreIdOrderByReceivedAtAsc(
                command.productId(), 
                command.storeId()
        );

        BigDecimal remainingToWriteOff = command.quantity();
        List<StockBatch> updatedBatches = new ArrayList<>();

        for (StockBatch batch : batches) {
            if (remainingToWriteOff.compareTo(BigDecimal.ZERO) == 0) {
                break;
            }

            BigDecimal toWriteOffFromBatch = batch.getQuantityRemaining().min(remainingToWriteOff);
            
            StockBatch updatedBatch = batch.writeOff(toWriteOffFromBatch);
            updatedBatches.add(updatedBatch);

            remainingToWriteOff = remainingToWriteOff.subtract(toWriteOffFromBatch);
        }

        if (remainingToWriteOff.compareTo(BigDecimal.ZERO) > 0) {
            throw new InsufficientStockException("Not enough stock for FIFO write-off in store %s for product %s"
                    .formatted(command.storeId(), command.productId()));
        }

        // 3. Batch Save
        stockBatchRepository.saveAll(updatedBatches);

        // 4. Record Transaction (Audit) - includes storeId correctly via command/context
        StockBalance balance = balanceLookup.findByProductIdAndStoreId(command.productId(), command.storeId())
                .orElseThrow(() -> new NotFoundException("StockBalance", 
                        command.productId() + " in store " + command.storeId()));
        
        StockTransaction transaction = StockTransaction.forWriteOff(
                command.productId(),
                command.storeId(),
                command.quantity(),
                balance.getAverageCost(),
                command.reason(),
                command.comment(),
                sourceDocId,
                command.performerId(),
                clock.instant()
        );
        // Ensure storeId is handled in transactions (domain model check if needed)
        transactionPort.save(transaction);

        // 5. Update Aggregate StockBalance (Branch specific)
        StockBalance updatedBalance = balance.writeOff(command.quantity());
        balancePersist.save(updatedBalance);

        // 6. Publish Event
        StockWrittenOffEvent domainEvent = StockWrittenOffEvent.from(transaction);
        eventPublisher.publish(domainEvent);
        
        // Spring Event для finance-service
        applicationEventPublisher.publishEvent(ru.florify.common.event.StockWrittenOffSpringEvent.of(
                domainEvent.sourceDocumentId() != null 
                        ? (domainEvent.sourceDocumentId().contains(":") && domainEvent.sourceDocumentId().split(":")[0].equals("order") 
                                ? java.util.UUID.fromString(domainEvent.sourceDocumentId().split(":")[1]) 
                                : transaction.id()) 
                        : transaction.id(),
                transaction.productId(),
                transaction.storeId(),
                transaction.totalValue(),
                domainEvent.reason(),
                clock.instant()
        ));

        // Фиксация финансового результата инвентаризации (недостача)
        if (sourceDocId.contains("INV-LOG") || sourceDocId.contains("AUDIT")) {
            applicationEventPublisher.publishEvent(new ru.florify.common.event.StockAdjustmentSpringEvent(
                    command.productId(),
                    command.storeId(),
                    command.quantity(),
                    transaction.totalValue(), // сумма в закупочных ценах
                    sourceDocId,
                    ru.florify.common.event.StockAdjustmentSpringEvent.AdjustmentType.LOSS,
                    clock.instant()
            ));
        }

        return transaction.totalValue();
    }
}
