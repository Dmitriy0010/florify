package ru.florify.order.adapter.out.persistence.mapper;

import org.mapstruct.*;
import ru.florify.order.adapter.out.persistence.entity.OrderJpaEntity;
import ru.florify.order.domain.model.Order;

@Mapper(componentModel = "spring", uses = {OrderItemJpaMapper.class, PaymentJpaMapper.class})
public interface OrderJpaMapper {

    @Mapping(target = "isPaid", source = "paid")
    OrderJpaEntity toEntity(Order domain);

    @Mapping(target = "isPaid", source = "isPaid")
    Order toDomain(OrderJpaEntity entity);

    @Mapping(target = "items", ignore = true)
    @Mapping(target = "isPaid", source = "isPaid")
    Order toDomainWithoutItems(OrderJpaEntity entity);

    @AfterMapping
    default void linkOrderItems(@MappingTarget OrderJpaEntity orderEntity) {
        if (orderEntity.getItems() != null) {
            orderEntity.getItems().forEach(item -> item.setOrder(orderEntity));
        }
    }
}
