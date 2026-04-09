package ru.florify.inventory.infrastructure.persistence.adapter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.inventory.domain.model.StockTransaction;
import ru.florify.inventory.domain.port.out.StockTransactionPort;
import ru.florify.inventory.infrastructure.persistence.entity.StockTransactionJpaEntity;
import ru.florify.inventory.infrastructure.persistence.repository.StockTransactionJpaRepository;

@Component
@RequiredArgsConstructor
public class StockTransactionPersistenceAdapter implements StockTransactionPort {
    private final StockTransactionJpaRepository repository;

    @Override
    public void save(StockTransaction transaction) {
        repository.save(mapToEntity(transaction));
    }

    @Override
    public boolean existsBySourceDocument(String sourceDocumentId) {
        return repository.existsBySourceDocumentId(sourceDocumentId);
    }

    private StockTransactionJpaEntity mapToEntity(StockTransaction domain) {
        return StockTransactionJpaEntity.builder()
                .id(domain.getId())
                .productId(domain.getProductId())
                .type(domain.getType())
                .quantity(domain.getQuantity())
                .costBasis(domain.getCostBasis())
                .totalValue(domain.getTotalValue())
                .writeOffReason(domain.getWriteOffReason())
                .comment(domain.getComment())
                .sourceDocumentId(domain.getSourceDocumentId())
                .performerId(domain.getPerformerId())
                .createdAt(domain.getCreatedAt())
                .build();
    }
}
