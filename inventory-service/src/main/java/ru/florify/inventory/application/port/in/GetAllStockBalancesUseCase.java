package ru.florify.inventory.application.port.in;

import ru.florify.common.usecase.UseCase;
import ru.florify.inventory.adapter.in.web.dto.EnhancedStockBalanceResponse;

import java.util.List;
import java.util.UUID;

/**
 * Use case to retrieve all current stock balances for a given store.
 * Includes product metadata (name, unit, etc.) for UI display.
 */
public interface GetAllStockBalancesUseCase extends UseCase<GetStocksQuery, List<EnhancedStockBalanceResponse>> {
}
