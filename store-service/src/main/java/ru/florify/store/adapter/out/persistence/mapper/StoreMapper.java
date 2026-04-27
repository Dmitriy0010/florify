package ru.florify.store.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ru.florify.store.adapter.out.persistence.entity.StoreJpaEntity;
import ru.florify.store.domain.model.Store;

@Mapper(componentModel = "spring")
public interface StoreMapper {
    Store toDomain(StoreJpaEntity entity);
    StoreJpaEntity toJpa(Store domain);
}
