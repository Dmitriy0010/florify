package ru.florify.store.adapter.in.web;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.store.application.port.in.CreateStoreCommand;
import ru.florify.store.domain.model.Store;

@Mapper(componentModel = "spring")
public interface StoreWebMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    Store toDomain(StoreRequest request);

    StoreResponse toResponse(Store domain);

    CreateStoreCommand toCommand(StoreRequest request);
}
