package ru.florify.inventory.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class WriteOffStockInteractor implements WriteOffStockUseCase {

    private final StockBalanceLookupPort balanceLookup;
    private final StockBalancePersistPort balancePersist;
    private final StockBatchRepository stockBatchRepository;
    private final StockTransactionPort transactionPort;
    private final EventPublisher eventPublisher;
    private final Clock clock;

    @Override
    @Transactional
    @Retryable(
            maxAttempts = 3,
            retryFor = ObjectOptimisticLockingFailureException.class,
            backoff = @Backoff(delay = 100, multiplier = 2)
    )
    public void execute(WriteOffCommand command) {
        log.info("Processing FIFO write-off for productId: {}, qty: {}", command.productId(), command.quantity());

        // 1. Idempotency Check
        if (transactionPort.existsBySourceDocument(command.sourceDocumentId())) {
            log.warn("Idempotency skip: sourceDocument {} already processed", command.sourceDocumentId());
            return;
        }

        // 2. FIFO: Fetch available batches sorted by arrival time
        List<StockBatch> batches = stockBatchRepository.findAvailableByProductIdOrderByReceivedAtAsc(command.productId());

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
            throw new InsufficientStockException("Not enough stock for FIFO write-off: " + command.productId());
        }

        // 3. Batch Save! (Atomic and optimized)
        stockBatchRepository.saveAll(updatedBatches);

        // 4. Record Transaction (Audit)
        StockBalance balance = balanceLookup.findByProductId(command.productId())
                .orElseThrow(() -> new NotFoundException("ProductBalance", command.productId()));
        
        StockTransaction transaction = StockTransaction.forWriteOff(
                command.productId(),
                command.quantity(),
                balance.getAverageCost(), // Carry forward WAC for reporting if needed
                command.reason(),
                command.comment(),
                command.sourceDocumentId(),
                command.performerId(),
                clock.instant()
        );
        transactionPort.save(transaction);

        // 5. Update Aggregate StockBalance
        StockBalance updatedBalance = balance.writeOff(command.quantity());
        balancePersist.save(updatedBalance);

        // 6. Publish Event
        eventPublisher.publish(StockWrittenOffEvent.from(transaction));
    }
}
