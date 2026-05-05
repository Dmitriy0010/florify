package ru.florify.delivery.adapter.out.persistence.mapper;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.delivery.adapter.out.persistence.entity.DeliveryZoneJpaEntity;
import ru.florify.delivery.domain.model.DeliveryZone;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:42+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class DeliveryZonePersistenceMapperImpl implements DeliveryZonePersistenceMapper {

    @Override
    public DeliveryZoneJpaEntity toEntity(DeliveryZone domain) {
        if ( domain == null ) {
            return null;
        }

        DeliveryZoneJpaEntity.DeliveryZoneJpaEntityBuilder deliveryZoneJpaEntity = DeliveryZoneJpaEntity.builder();

        deliveryZoneJpaEntity.active( domain.isActive() );
        deliveryZoneJpaEntity.createdAt( domain.getCreatedAt() );
        deliveryZoneJpaEntity.deliveryFee( domain.getDeliveryFee() );
        deliveryZoneJpaEntity.id( domain.getId() );
        deliveryZoneJpaEntity.minOrderAmount( domain.getMinOrderAmount() );
        deliveryZoneJpaEntity.name( domain.getName() );
        deliveryZoneJpaEntity.polygon( domain.getPolygon() );

        return deliveryZoneJpaEntity.build();
    }

    @Override
    public DeliveryZone toDomain(DeliveryZoneJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        DeliveryZone.DeliveryZoneBuilder deliveryZone = DeliveryZone.builder();

        deliveryZone.active( entity.isActive() );
        deliveryZone.createdAt( entity.getCreatedAt() );
        deliveryZone.deliveryFee( entity.getDeliveryFee() );
        deliveryZone.id( entity.getId() );
        deliveryZone.minOrderAmount( entity.getMinOrderAmount() );
        deliveryZone.name( entity.getName() );
        deliveryZone.polygon( entity.getPolygon() );

        return deliveryZone.build();
    }
}
