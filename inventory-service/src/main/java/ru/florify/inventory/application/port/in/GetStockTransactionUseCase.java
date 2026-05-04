package ru.florify.inventory.application.port.in;

import ru.florify.inventory.domain.model.StockTransaction;
import java.util.UUID;

public interface GetStockTransactionUseCase {
    StockTransaction execute(UUID transactionId);
}
