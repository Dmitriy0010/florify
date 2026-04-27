package ru.florify.analytics.adapter.out.persistence.adapter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.analytics.adapter.out.persistence.entity.CostFactJpaEntity;
import ru.florify.analytics.adapter.out.persistence.entity.CostFactType;
import ru.florify.analytics.adapter.out.persistence.repository.CostFactJpaRepository;
import ru.florify.analytics.application.port.out.WriteoffFactRepository;
import ru.florify.analytics.application.result.InventoryStatsResult;
import ru.florify.analytics.domain.model.WriteoffFact;

import java.time.Instant;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class WriteoffFactPersistenceAdapter implements WriteoffFactRepository {
    private final CostFactJpaRepository repository;

    @Override
    public void save(WriteoffFact fact) {
        repository.save(CostFactJpaEntity.builder()
                .id(fact.getId())
                .costType(CostFactType.WRITEOFF)
                .sourceRefId(fact.getSourceEventId())
                .storeId(fact.getStoreId())
                .occurredAt(fact.getWrittenOffAt())
                .recordedAt(fact.getRecordedAt())
                .quantity(fact.getQuantity())
                .reason(fact.getReason())
                .productId(fact.getProductId())
                .productName(fact.getProductName())
                .categoryId(fact.getCategoryId())
                .categoryName(fact.getCategoryName())
                .build());
    }

    @Override
    public boolean existsBySourceEventId(UUID sourceEventId) {
        return repository.existsByCostTypeAndSourceRefId(CostFactType.WRITEOFF, sourceEventId);
    }

    @Override
    public InventoryStatsResult aggregateInventoryStats(Instant monthStart) {
        return new InventoryStatsResult(repository.sumQuantityAfterByType(CostFactType.WRITEOFF, monthStart));
    }
}
