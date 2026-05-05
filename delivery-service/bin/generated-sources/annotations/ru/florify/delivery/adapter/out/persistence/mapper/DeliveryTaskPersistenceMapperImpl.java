package ru.florify.delivery.adapter.out.persistence.mapper;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.delivery.adapter.out.persistence.entity.DeliveryTaskJpaEntity;
import ru.florify.delivery.domain.model.DeliveryTask;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:41+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class DeliveryTaskPersistenceMapperImpl implements DeliveryTaskPersistenceMapper {

    @Override
    public DeliveryTaskJpaEntity toEntity(DeliveryTask domain) {
        if ( domain == null ) {
            return null;
        }

        DeliveryTaskJpaEntity.DeliveryTaskJpaEntityBuilder deliveryTaskJpaEntity = DeliveryTaskJpaEntity.builder();

        deliveryTaskJpaEntity.actualDeliveredAt( domain.getActualDeliveredAt() );
        deliveryTaskJpaEntity.courierId( domain.getCourierId() );
        deliveryTaskJpaEntity.createdAt( domain.getCreatedAt() );
        deliveryTaskJpaEntity.deliveryAddress( domain.getDeliveryAddress() );
        deliveryTaskJpaEntity.estimatedArrival( domain.getEstimatedArrival() );
        deliveryTaskJpaEntity.failureReason( domain.getFailureReason() );
        deliveryTaskJpaEntity.id( domain.getId() );
        deliveryTaskJpaEntity.latitude( domain.getLatitude() );
        deliveryTaskJpaEntity.longitude( domain.getLongitude() );
        deliveryTaskJpaEntity.orderId( domain.getOrderId() );
        deliveryTaskJpaEntity.slotId( domain.getSlotId() );
        deliveryTaskJpaEntity.status( domain.getStatus() );
        deliveryTaskJpaEntity.updatedAt( domain.getUpdatedAt() );
        deliveryTaskJpaEntity.zoneId( domain.getZoneId() );

        return deliveryTaskJpaEntity.build();
    }

    @Override
    public DeliveryTask toDomain(DeliveryTaskJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        DeliveryTask.DeliveryTaskBuilder deliveryTask = DeliveryTask.builder();

        deliveryTask.actualDeliveredAt( entity.getActualDeliveredAt() );
        deliveryTask.courierId( entity.getCourierId() );
        deliveryTask.createdAt( entity.getCreatedAt() );
        deliveryTask.deliveryAddress( entity.getDeliveryAddress() );
        deliveryTask.estimatedArrival( entity.getEstimatedArrival() );
        deliveryTask.failureReason( entity.getFailureReason() );
        deliveryTask.id( entity.getId() );
        deliveryTask.latitude( entity.getLatitude() );
        deliveryTask.longitude( entity.getLongitude() );
        deliveryTask.orderId( entity.getOrderId() );
        deliveryTask.slotId( entity.getSlotId() );
        deliveryTask.status( entity.getStatus() );
        deliveryTask.updatedAt( entity.getUpdatedAt() );
        deliveryTask.zoneId( entity.getZoneId() );

        return deliveryTask.build();
    }
}
