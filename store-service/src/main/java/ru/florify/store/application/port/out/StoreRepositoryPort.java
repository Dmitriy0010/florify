package ru.florify.store.application.port.out;

import ru.florify.store.domain.model.Store;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StoreRepositoryPort {
    Store save(Store store);
    Optional<Store> findById(UUID id);
    List<Store> findAll();
    void delete(UUID id);
}
