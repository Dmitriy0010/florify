package ru.florify.inventory.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.inventory.application.port.in.GetStockBalanceUseCase;
import ru.florify.inventory.application.port.out.StockBalanceLookupPort;
import ru.florify.inventory.domain.model.StockBalance;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetStockBalanceInteractor implements GetStockBalanceUseCase {
    private final StockBalanceLookupPort lookupPort;

    @Override
    @Transactional(readOnly = true)
    public StockBalance execute(UUID productId) {
        return lookupPort.findByProductId(productId)
                .orElseGet(() -> StockBalance.createEmpty(productId));
    }
}
