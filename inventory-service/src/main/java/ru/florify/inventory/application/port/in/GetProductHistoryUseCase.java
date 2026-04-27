package ru.florify.inventory.application.port.in;

import ru.florify.inventory.domain.model.StockTransaction;
import ru.florify.inventory.application.query.PagedResult;

import java.util.UUID;

public interface GetProductHistoryUseCase {
    PagedResult<StockTransaction> execute(UUID productId, int page, int size);
}
