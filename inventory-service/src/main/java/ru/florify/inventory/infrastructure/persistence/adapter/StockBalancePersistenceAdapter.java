package ru.florify.inventory.infrastructure.persistence.adapter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.inventory.domain.model.StockBalance;
import ru.florify.inventory.domain.port.out.StockBalanceLookupPort;
import ru.florify.inventory.domain.port.out.StockBalancePersistPort;
import ru.florify.inventory.infrastructure.persistence.entity.StockBalanceJpaEntity;
import ru.florify.inventory.infrastructure.persistence.repository.StockBalanceJpaRepository;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class StockBalancePersistenceAdapter implements StockBalanceLookupPort, StockBalancePersistPort {
    private final StockBalanceJpaRepository repository;

    @Override
    public Optional<StockBalance> findByProductId(UUID productId) {
        return repository.findByProductId(productId).map(this::mapToDomain);
    }

    @Override
    public void save(StockBalance balance) {
        StockBalanceJpaEntity entity = repository.findById(balance.getId())
                .orElseGet(() -> StockBalanceJpaEntity.builder()
                        .id(balance.getId())
                        .productId(balance.getProductId())
                        .build());
        
        entity.setQuantityInStock(balance.getQuantityInStock());
        entity.setAverageCost(balance.getAverageCost());
        entity.setVersion(balance.getVersion());
        
        repository.save(entity);
    }

    private StockBalance mapToDomain(StockBalanceJpaEntity entity) {
        return new StockBalance(
                entity.getId(),
                entity.getProductId(),
                entity.getQuantityInStock(),
                entity.getAverageCost(),
                entity.getVersion()
        );
    }
}
