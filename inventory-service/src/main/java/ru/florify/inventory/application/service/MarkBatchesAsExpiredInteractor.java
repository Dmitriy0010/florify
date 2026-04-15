package ru.florify.inventory.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.exception.NotFoundException;
import ru.florify.inventory.application.port.in.MarkBatchesAsExpiredUseCase;
import ru.florify.inventory.application.port.out.*;
import ru.florify.inventory.domain.event.StockExpiredEvent;
import ru.florify.inventory.domain.model.BatchStatus;
import ru.florify.inventory.domain.model.StockBalance;
import ru.florify.inventory.domain.model.StockBatch;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarkBatchesAsExpiredInteractor implements MarkBatchesAsExpiredUseCase {

    private final StockBatchRepository stockBatchRepository;
    private final StockBalanceLookupPort balanceLookup;
    private final StockBalancePersistPort balancePersist;
    private final EventPublisher eventPublisher;
    private final Clock clock;

    @Override
    @Transactional
    @Retryable(maxAttempts = 3, retryFor = ObjectOptimisticLockingFailureException.class)
    public int execute() {
        Instant now = Instant.now(clock);
        log.info("Checking for expired batches at {}", now);

        List<StockBatch> expiredBatches = stockBatchRepository.findExpiredBatches(now);
        if (expiredBatches.isEmpty()) {
            return 0;
        }

        log.info("Found {} batches to expire", expiredBatches.size());

        // Group expired quantities by productId to minimize DB calls for StockBalance
        Map<java.util.UUID, java.math.BigDecimal> totalExpiredByProduct = expiredBatches.stream()
                .collect(Collectors.groupingBy(
                        StockBatch::getProductId,
                        Collectors.reducing(
                                java.math.BigDecimal.ZERO,
                                StockBatch::getQuantityRemaining,
                                java.math.BigDecimal::add
                        )
                ));

        // 1. Update Batches
        List<StockBatch> updatedBatches = expiredBatches.stream()
                .map(batch -> batch.withStatus(BatchStatus.EXPIRED))
                .toList();
        stockBatchRepository.saveAll(updatedBatches);

        // 2. Sync Global Balance and Publish Events
        totalExpiredByProduct.forEach((productId, expiredQty) -> {
            if (expiredQty.compareTo(java.math.BigDecimal.ZERO) > 0) {
                StockBalance balance = balanceLookup.findByProductId(productId)
                        .orElseThrow(() -> new NotFoundException("ProductBalance", productId));

                StockBalance updatedBalance = balance.writeOff(expiredQty);
                balancePersist.save(updatedBalance);

                eventPublisher.publish(StockExpiredEvent.from(productId, expiredQty, now));
                log.info("Expired {} units for product {}", expiredQty, productId);
            }
        });

        return updatedBatches.size();
    }
}
