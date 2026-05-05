package ru.florify.delivery.adapter.out.persistence.mapper;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.delivery.adapter.out.persistence.entity.DeliverySlotJpaEntity;
import ru.florify.delivery.domain.model.DeliverySlot;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:42+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class DeliverySlotPersistenceMapperImpl implements DeliverySlotPersistenceMapper {

    @Override
    public DeliverySlotJpaEntity toEntity(DeliverySlot domain) {
        if ( domain == null ) {
            return null;
        }

        DeliverySlotJpaEntity.DeliverySlotJpaEntityBuilder deliverySlotJpaEntity = DeliverySlotJpaEntity.builder();

        deliverySlotJpaEntity.currentLoad( domain.getCurrentLoad() );
        deliverySlotJpaEntity.date( domain.getDate() );
        deliverySlotJpaEntity.endTime( domain.getEndTime() );
        deliverySlotJpaEntity.id( domain.getId() );
        deliverySlotJpaEntity.maxCapacity( domain.getMaxCapacity() );
        deliverySlotJpaEntity.startTime( domain.getStartTime() );

        return deliverySlotJpaEntity.build();
    }

    @Override
    public DeliverySlot toDomain(DeliverySlotJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        DeliverySlot.DeliverySlotBuilder deliverySlot = DeliverySlot.builder();

        deliverySlot.currentLoad( entity.getCurrentLoad() );
        deliverySlot.date( entity.getDate() );
        deliverySlot.endTime( entity.getEndTime() );
        deliverySlot.id( entity.getId() );
        deliverySlot.maxCapacity( entity.getMaxCapacity() );
        deliverySlot.startTime( entity.getStartTime() );

        return deliverySlot.build();
    }
}
