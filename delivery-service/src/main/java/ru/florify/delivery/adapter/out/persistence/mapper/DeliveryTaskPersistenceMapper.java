package ru.florify.delivery.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ru.florify.delivery.adapter.out.persistence.entity.DeliveryTaskJpaEntity;
import ru.florify.delivery.domain.model.DeliveryTask;

@Mapper(componentModel = "spring")
public interface DeliveryTaskPersistenceMapper {

    DeliveryTaskJpaEntity toEntity(DeliveryTask domain);

    DeliveryTask toDomain(DeliveryTaskJpaEntity entity);
}
