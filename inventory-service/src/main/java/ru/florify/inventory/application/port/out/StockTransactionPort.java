package ru.florify.inventory.application.port.out;

import ru.florify.inventory.application.query.PagedResult;
import ru.florify.inventory.domain.model.StockTransaction;

import java.util.UUID;

public interface StockTransactionPort {
    void save(StockTransaction transaction);
    boolean existsBySourceDocument(String sourceDocumentId);
    boolean existsBySourceDocumentAndProductId(String sourceDocumentId, UUID productId);
    PagedResult<StockTransaction> findAllByProductId(UUID productId, int page, int size);
}
