package ru.florify.analytics.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.analytics.adapter.out.persistence.entity.OrderFactJpaEntity;
import ru.florify.analytics.domain.model.OrderFact;

@Mapper(componentModel = "spring")
public interface OrderFactPersistenceMapper {
    @Mapping(target = "id", source = "id")
    @Mapping(target = "storeId", source = "storeId")
    OrderFactJpaEntity toEntity(OrderFact domain);
    
    @Mapping(target = "id", source = "id")
    @Mapping(target = "storeId", source = "storeId")
    OrderFact toDomain(OrderFactJpaEntity entity);
}
