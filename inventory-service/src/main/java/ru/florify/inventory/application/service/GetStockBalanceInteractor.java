package ru.florify.inventory.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.inventory.application.port.in.GetStockBalanceUseCase;
import ru.florify.inventory.application.port.in.StockBalanceQuery;
import ru.florify.inventory.application.port.out.StockBalanceLookupPort;
import ru.florify.inventory.domain.model.StockBalance;

@Service
@RequiredArgsConstructor
public class GetStockBalanceInteractor implements GetStockBalanceUseCase {
    private final StockBalanceLookupPort lookupPort;

    @Override
    @Transactional(readOnly = true)
    public StockBalance execute(StockBalanceQuery query) {
        return lookupPort.findByProductIdAndStoreId(query.productId(), query.storeId())
                .orElseGet(() -> StockBalance.createEmpty(query.productId(), query.storeId()));
    }
}
