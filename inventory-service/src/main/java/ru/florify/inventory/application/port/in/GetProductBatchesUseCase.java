package ru.florify.inventory.application.port.in;

import ru.florify.inventory.domain.model.StockBatch;

import java.util.List;
import java.util.UUID;

/**
 * Use case for retrieving all batches (partii) for a given product across all statuses.
 */
public interface GetProductBatchesUseCase {
    List<StockBatch> execute(UUID productId);
}
