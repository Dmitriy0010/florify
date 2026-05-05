package ru.florify.delivery.adapter.in.web.mapper;

import java.math.BigDecimal;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.delivery.adapter.in.web.dto.CreateDeliveryZoneRequest;
import ru.florify.delivery.adapter.in.web.dto.DeliveryZoneResponse;
import ru.florify.delivery.adapter.in.web.dto.UpdateDeliveryZoneRequest;
import ru.florify.delivery.application.command.CreateDeliveryZoneCommand;
import ru.florify.delivery.application.command.UpdateDeliveryZoneCommand;
import ru.florify.delivery.domain.model.DeliveryZone;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T16:49:15+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class DeliveryZoneWebMapperImpl implements DeliveryZoneWebMapper {

    @Override
    public CreateDeliveryZoneCommand toCommand(CreateDeliveryZoneRequest request, UUID performerId) {
        if ( request == null && performerId == null ) {
            return null;
        }

        String name = null;
        String polygon = null;
        BigDecimal deliveryFee = null;
        BigDecimal minOrderAmount = null;
        boolean active = false;
        if ( request != null ) {
            name = request.name();
            polygon = request.polygon();
            deliveryFee = request.deliveryFee();
            minOrderAmount = request.minOrderAmount();
            active = request.active();
        }
        UUID performerId1 = null;
        performerId1 = performerId;

        CreateDeliveryZoneCommand createDeliveryZoneCommand = new CreateDeliveryZoneCommand( name, polygon, deliveryFee, minOrderAmount, active, performerId1 );

        return createDeliveryZoneCommand;
    }

    @Override
    public UpdateDeliveryZoneCommand toCommand(UpdateDeliveryZoneRequest request, UUID id, UUID performerId) {
        if ( request == null && id == null && performerId == null ) {
            return null;
        }

        String name = null;
        String polygon = null;
        BigDecimal deliveryFee = null;
        BigDecimal minOrderAmount = null;
        boolean active = false;
        if ( request != null ) {
            name = request.name();
            polygon = request.polygon();
            deliveryFee = request.deliveryFee();
            minOrderAmount = request.minOrderAmount();
            active = request.active();
        }
        UUID zoneId = null;
        zoneId = id;
        UUID performerId1 = null;
        performerId1 = performerId;

        UpdateDeliveryZoneCommand updateDeliveryZoneCommand = new UpdateDeliveryZoneCommand( zoneId, name, polygon, deliveryFee, minOrderAmount, active, performerId1 );

        return updateDeliveryZoneCommand;
    }

    @Override
    public DeliveryZoneResponse toResponse(DeliveryZone zone) {
        if ( zone == null ) {
            return null;
        }

        UUID id = null;
        String name = null;
        String polygon = null;
        BigDecimal deliveryFee = null;
        BigDecimal minOrderAmount = null;
        boolean active = false;

        id = zone.getId();
        name = zone.getName();
        polygon = zone.getPolygon();
        deliveryFee = zone.getDeliveryFee();
        minOrderAmount = zone.getMinOrderAmount();
        active = zone.isActive();

        DeliveryZoneResponse deliveryZoneResponse = new DeliveryZoneResponse( id, name, polygon, deliveryFee, minOrderAmount, active );

        return deliveryZoneResponse;
    }
}
