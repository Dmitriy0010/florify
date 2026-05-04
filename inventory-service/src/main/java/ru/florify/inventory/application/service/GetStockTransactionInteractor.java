package ru.florify.inventory.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.inventory.application.port.in.GetStockTransactionUseCase;
import ru.florify.inventory.application.port.out.StockTransactionPort;
import ru.florify.inventory.domain.model.StockTransaction;
import ru.florify.common.exception.NotFoundException;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GetStockTransactionInteractor implements GetStockTransactionUseCase {

    private final StockTransactionPort transactionPort;

    @Override
    @Transactional(readOnly = true)
    public StockTransaction execute(UUID transactionId) {
        log.info("Fetching stock transaction by ID: {}", transactionId);
        return transactionPort.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("StockTransaction", transactionId));
    }
}
