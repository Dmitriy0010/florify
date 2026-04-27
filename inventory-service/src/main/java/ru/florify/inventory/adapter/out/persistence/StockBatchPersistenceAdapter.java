package ru.florify.inventory.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.inventory.adapter.out.persistence.mapper.StockBatchMapper;
import ru.florify.inventory.adapter.out.persistence.repository.StockBatchJpaRepository;
import ru.florify.inventory.application.port.out.StockBatchRepository;
import ru.florify.inventory.domain.model.StockBatch;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class StockBatchPersistenceAdapter implements StockBatchRepository {

    private final StockBatchJpaRepository repository;
    private final StockBatchMapper mapper;

    @Override
    public void save(StockBatch batch) {
        repository.save(mapper.toEntity(batch));
    }

    @Override
    public void saveAll(List<StockBatch> batches) {
        repository.saveAll(mapper.toEntityList(batches));
    }

    @Override
    public List<StockBatch> findAvailableByProductIdAndStoreIdOrderByReceivedAtAsc(UUID productId, UUID storeId) {
        return mapper.toDomainList(repository.findAvailableByProductIdAndStoreIdOrderByReceivedAtAsc(productId, storeId));
    }

    @Override
    public List<StockBatch> findExpiredBatches(Instant now) {
        return mapper.toDomainList(repository.findExpiredBatches(now));
    }

    @Override
    public List<StockBatch> findAllByProductId(UUID productId) {
        return mapper.toDomainList(repository.findByProductIdOrderByReceivedAtDesc(productId));
    }
}
