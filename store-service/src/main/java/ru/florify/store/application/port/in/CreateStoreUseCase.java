package ru.florify.store.application.port.in;

import ru.florify.store.domain.model.Store;

public interface CreateStoreUseCase {
    Store createStore(CreateStoreCommand command);
}
