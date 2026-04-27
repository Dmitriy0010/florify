package ru.florify.delivery.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ru.florify.delivery.adapter.out.persistence.entity.DeliveryZoneJpaEntity;
import ru.florify.delivery.domain.model.DeliveryZone;

@Mapper(componentModel = "spring")
public interface DeliveryZonePersistenceMapper {

    DeliveryZoneJpaEntity toEntity(DeliveryZone domain);

    DeliveryZone toDomain(DeliveryZoneJpaEntity entity);
}
