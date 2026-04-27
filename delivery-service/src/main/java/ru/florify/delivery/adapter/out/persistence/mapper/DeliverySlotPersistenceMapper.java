package ru.florify.delivery.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ru.florify.delivery.adapter.out.persistence.entity.DeliverySlotJpaEntity;
import ru.florify.delivery.domain.model.DeliverySlot;

@Mapper(componentModel = "spring")
public interface DeliverySlotPersistenceMapper {

    DeliverySlotJpaEntity toEntity(DeliverySlot domain);

    DeliverySlot toDomain(DeliverySlotJpaEntity entity);
}
