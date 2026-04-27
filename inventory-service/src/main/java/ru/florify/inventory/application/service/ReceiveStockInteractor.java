package ru.florify.inventory.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.exception.NotFoundException;
import ru.florify.inventory.application.command.ReceiveStockCommand;
import ru.florify.inventory.application.port.in.ReceiveStockUseCase;
import ru.florify.inventory.application.port.out.*;
import ru.florify.inventory.domain.exception.InactiveProductException;
import ru.florify.inventory.domain.event.StockReceivedEvent;
import ru.florify.inventory.domain.model.BatchStatus;
import ru.florify.inventory.domain.model.CatalogProduct;
import ru.florify.inventory.domain.model.StockBalance;
import ru.florify.inventory.domain.model.StockBatch;
import ru.florify.inventory.domain.model.StockTransaction;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReceiveStockInteractor implements ReceiveStockUseCase {

    private final ProductLookupPort productLookup;
    private final StockBalanceLookupPort balanceLookup;
    private final StockBalancePersistPort balancePersist;
    private final StockBatchRepository stockBatchRepository;
    private final StockTransactionPort transactionPort;
    private final EventPublisher eventPublisher;
    private final org.springframework.context.ApplicationEventPublisher springEventPublisher;
    private final Clock clock;

    @Override
    @Transactional
    @Retryable(
            maxAttempts = 3,
            retryFor = ObjectOptimisticLockingFailureException.class,
            backoff = @Backoff(delay = 100, multiplier = 2)
    )
    public void execute(ReceiveStockCommand command) {
        String sourceDocId = command.sourceDocumentId();
        if (sourceDocId == null || sourceDocId.isBlank() || sourceDocId.equals("null")) {
            sourceDocId = "REC-" + java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")
                    .withZone(java.time.ZoneId.systemDefault())
                    .format(clock.instant()) + "-" + UUID.randomUUID().toString().substring(0, 4);
        }

        log.info("Receiving FIFO stock for productId: {}, qty: {}, storeId: {}, doc: {}", 
                command.productId(), command.quantity(), command.storeId(), sourceDocId);

        // 1. Idempotency Check - scoped to sourceDocument + productId
        if (transactionPort.existsBySourceDocumentAndProductId(sourceDocId, command.productId())) {
            log.warn("Idempotency skip: sourceDocument {} for product {} already processed", 
                    sourceDocId, command.productId());
            return;
        }

        // 2. Fetch Product
        CatalogProduct product = productLookup.findById(command.productId())
                .orElseThrow(() -> new NotFoundException("Product", command.productId()));

        if (!product.isActive()) {
            log.warn("Receiving stock for inactive product: {}. Proceeding as requested.", command.productId());
        }

        Instant now = Instant.now(clock);

        // 3. Create NEW StockBatch (FIFO tracking)
        StockBatch newBatch = StockBatch.builder()
                .id(UUID.randomUUID())
                .productId(command.productId())
                .storeId(command.storeId())
                .supplierId(command.supplierId())
                .quantityReceived(command.quantity())
                .quantityRemaining(command.quantity())
                .unitCost(command.purchasePrice())
                .receivedAt(now)
                .expiresAt(command.expiresAt())
                .status(BatchStatus.AVAILABLE)
                .sourceDocumentId(sourceDocId)
                .build();
        
        stockBatchRepository.save(newBatch);

        // 4. Update Aggregate StockBalance
        StockBalance balance = balanceLookup.findByProductIdAndStoreId(command.productId(), command.storeId())
                .orElseGet(() -> StockBalance.createEmpty(command.productId(), command.storeId()));

        StockBalance updatedBalance = balance.receive(command.quantity(), command.purchasePrice());
        balancePersist.save(updatedBalance);

        // 5. Record Transaction (Audit)
        StockTransaction transaction = StockTransaction.forInbound(
                command.productId(),
                command.storeId(),
                command.quantity(),
                command.purchasePrice(),
                sourceDocId,
                command.performerId(),
                now
        );
        transactionPort.save(transaction);

        // 6. Publish Kafka Event
        eventPublisher.publish(StockReceivedEvent.of(
                newBatch.getId(), 
                command.productId(), 
                command.storeId(),
                command.quantity(), 
                command.purchasePrice(), 
                now
        ));

        // 7. Publish Spring Event for finance (only if it's an inventory audit surplus)
        if (sourceDocId.contains("INV-AUDIT")) {
            springEventPublisher.publishEvent(new ru.florify.common.event.StockAdjustmentSpringEvent(
                    command.productId(),
                    command.storeId(),
                    command.quantity(),
                    command.purchasePrice().multiply(command.quantity()),
                    sourceDocId,
                    ru.florify.common.event.StockAdjustmentSpringEvent.AdjustmentType.SURPLUS,
                    now
            ));
        }
    }
}
