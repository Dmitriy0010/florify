package ru.florify.store.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.store.application.port.in.CreateStoreCommand;
import ru.florify.store.application.port.in.CreateStoreUseCase;
import ru.florify.store.application.port.out.StoreRepositoryPort;
import ru.florify.store.domain.model.Store;

@Service
@RequiredArgsConstructor
public class CreateStoreInteractor implements CreateStoreUseCase {
    private final StoreRepositoryPort storeRepository;

    @Override
    @Transactional
    public Store createStore(CreateStoreCommand command) {
        Store store = Store.create(
            command.name(),
            command.address(),
            command.phone(),
            command.active()
        );
        
        return storeRepository.save(store);
    }
}
