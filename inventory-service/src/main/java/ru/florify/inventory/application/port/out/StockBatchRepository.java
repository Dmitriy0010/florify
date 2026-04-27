package ru.florify.inventory.application.port.out;

import ru.florify.inventory.domain.model.StockBatch;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface StockBatchRepository {
    void save(StockBatch batch);
    void saveAll(List<StockBatch> batches);
    List<StockBatch> findAvailableByProductIdAndStoreIdOrderByReceivedAtAsc(UUID productId, UUID storeId);
    List<StockBatch> findExpiredBatches(Instant now);
    List<StockBatch> findAllByProductId(UUID productId);
}
