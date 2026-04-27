package ru.florify.store.application.port.in;

import ru.florify.store.domain.model.Store;

public interface UpdateStoreUseCase {
    Store updateStore(UpdateStoreCommand command);
}
