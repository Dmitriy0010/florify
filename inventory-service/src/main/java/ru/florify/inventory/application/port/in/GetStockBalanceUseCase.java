package ru.florify.inventory.application.port.in;

import ru.florify.common.usecase.UseCase;
import ru.florify.inventory.domain.model.StockBalance;

import java.util.UUID;

public interface GetStockBalanceUseCase extends UseCase<UUID, StockBalance> {
}
