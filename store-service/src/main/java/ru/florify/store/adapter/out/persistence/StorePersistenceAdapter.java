package ru.florify.store.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.store.adapter.out.persistence.entity.StoreJpaEntity;
import ru.florify.store.adapter.out.persistence.mapper.StoreMapper;
import ru.florify.store.adapter.out.persistence.repository.StoreJpaRepository;
import ru.florify.store.application.port.out.StoreRepositoryPort;
import ru.florify.store.domain.model.Store;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class StorePersistenceAdapter implements StoreRepositoryPort {
    private final StoreJpaRepository repository;
    private final StoreMapper mapper;

    @Override
    public Store save(Store store) {
        StoreJpaEntity entity = mapper.toJpa(store);
        StoreJpaEntity saved = repository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Store> findById(UUID id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Store> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(UUID id) {
        repository.deleteById(id);
    }
}
