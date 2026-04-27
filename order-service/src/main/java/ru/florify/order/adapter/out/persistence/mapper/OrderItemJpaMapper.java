package ru.florify.order.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.order.adapter.out.persistence.entity.OrderItemJpaEntity;
import ru.florify.order.domain.model.OrderItem;

@Mapper(componentModel = "spring")
public interface OrderItemJpaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "lineTotal", expression = "java(domain.lineTotal())")
    OrderItemJpaEntity toEntity(OrderItem domain);

    OrderItem toDomain(OrderItemJpaEntity entity);
}
