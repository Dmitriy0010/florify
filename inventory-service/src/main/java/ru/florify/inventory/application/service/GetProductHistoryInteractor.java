package ru.florify.inventory.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.inventory.application.port.in.GetProductHistoryUseCase;
import ru.florify.inventory.application.port.out.StockTransactionPort;
import ru.florify.inventory.domain.model.StockTransaction;
import ru.florify.inventory.application.query.PagedResult;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetProductHistoryInteractor implements GetProductHistoryUseCase {

    private final StockTransactionPort transactionPort;

    @Override
    @Transactional(readOnly = true)
    public PagedResult<StockTransaction> execute(UUID productId, int page, int size) {
        return transactionPort.findAllByProductId(productId, page, size);
    }
}
