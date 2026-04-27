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
import java.util.UUID;
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

        // 1. Update Batches to EXPIRED status
        List<StockBatch> updatedBatches = expiredBatches.stream()
                .map(batch -> batch.withStatus(BatchStatus.EXPIRED))
                .toList();
        stockBatchRepository.saveAll(updatedBatches);

        // 2. Group expired quantities by productId AND storeId to sync balances correctly
        // We use a helper structure or just group by a custom key. For simplicity, we'll use groupingBy.
        record ProductStoreKey(UUID productId, UUID storeId) {}

        Map<ProductStoreKey, java.math.BigDecimal> totalsToDegrade = updatedBatches.stream()
                .collect(Collectors.groupingBy(
                        batch -> new ProductStoreKey(batch.getProductId(), batch.getStoreId()),
                        Collectors.reducing(
                                java.math.BigDecimal.ZERO,
                                StockBatch::getQuantityRemaining,
                                java.math.BigDecimal::add
                        )
                ));

        // 3. Sync Balances for each product-store combination
        totalsToDegrade.forEach((key, expiredQty) -> {
            if (expiredQty.compareTo(java.math.BigDecimal.ZERO) > 0) {
                StockBalance balance = balanceLookup.findByProductIdAndStoreId(key.productId(), key.storeId())
                        .orElseThrow(() -> new NotFoundException("StockBalance", 
                                key.productId() + " in store " + key.storeId()));

                StockBalance updatedBalance = balance.writeOff(expiredQty);
                balancePersist.save(updatedBalance);

                // Publish event (could be updated later to include storeId if needed by subscribers)
                eventPublisher.publish(StockExpiredEvent.from(key.productId(), expiredQty, now));
                log.info("Expired {} units for product {} in store {}", expiredQty, key.productId(), key.storeId());
            }
        });

        return updatedBatches.size();
    }
}
