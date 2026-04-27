package ru.florify.store.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.store.application.port.in.UpdateStoreCommand;
import ru.florify.store.application.port.in.UpdateStoreUseCase;
import ru.florify.store.application.port.out.StoreRepositoryPort;
import ru.florify.store.domain.model.Store;

@Service
@RequiredArgsConstructor
public class UpdateStoreInteractor implements UpdateStoreUseCase {
    private final StoreRepositoryPort storeRepository;

    @Override
    @Transactional
    public Store updateStore(UpdateStoreCommand command) {
        Store store = storeRepository.findById(command.id())
                .orElseThrow(() -> new RuntimeException("Store not found"));

        Store updatedStore = store.toBuilder()
                .name(command.name())
                .address(command.address())
                .phone(command.phone())
                .active(command.active())
                .build();

        return storeRepository.save(updatedStore);
    }
}
