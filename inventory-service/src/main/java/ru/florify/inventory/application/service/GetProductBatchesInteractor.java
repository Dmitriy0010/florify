package ru.florify.inventory.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.inventory.application.port.in.GetProductBatchesUseCase;
import ru.florify.inventory.application.port.out.StockBatchRepository;
import ru.florify.inventory.domain.model.StockBatch;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetProductBatchesInteractor implements GetProductBatchesUseCase {

    private final StockBatchRepository stockBatchRepository;

    @Override
    @Transactional(readOnly = true)
    public List<StockBatch> execute(UUID productId) {
        return stockBatchRepository.findAllByProductId(productId);
    }
}
