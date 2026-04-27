package ru.florify.inventory.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.inventory.adapter.out.persistence.entity.StockBalanceJpaEntity;
import ru.florify.inventory.adapter.out.persistence.mapper.StockJpaMapper;
import ru.florify.inventory.adapter.out.persistence.repository.StockBalanceJpaRepository;
import ru.florify.inventory.application.port.out.StockBalanceLookupPort;
import ru.florify.inventory.application.port.out.StockBalancePersistPort;
import ru.florify.inventory.domain.model.StockBalance;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class StockBalancePersistenceAdapter implements StockBalanceLookupPort, StockBalancePersistPort {
    private final StockBalanceJpaRepository repository;
    private final StockJpaMapper mapper;

    @Override
    public Optional<StockBalance> findByProductIdAndStoreId(UUID productId, UUID storeId) {
        return repository.findByProductIdAndStoreId(productId, storeId)
                .map(mapper::toDomain);
    }

    @Override
    public List<StockBalance> findAllByProductIds(List<UUID> productIds) {
        // Implementation might need storeId later, for now maintaining backward compatibility if possible
        // but the repository now requires storeId for the plural method as well.
        // Assuming global search is not needed here or we pass null.
        return repository.findAllByProductIdInAndStoreId(productIds, null).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<StockBalance> findAllByStoreId(UUID storeId, boolean includeArchived) {
        return repository.findByStoreIdWithArchivedFilter(storeId, includeArchived).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public StockBalance save(StockBalance balance) {
        StockBalanceJpaEntity entity = mapper.toEntity(balance);
        StockBalanceJpaEntity saved = repository.save(entity);
        return mapper.toDomain(saved);
    }
}
