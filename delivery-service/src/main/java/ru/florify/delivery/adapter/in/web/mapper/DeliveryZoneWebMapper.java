package ru.florify.delivery.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.delivery.adapter.in.web.dto.CreateDeliveryZoneRequest;
import ru.florify.delivery.adapter.in.web.dto.DeliveryZoneResponse;
import ru.florify.delivery.adapter.in.web.dto.UpdateDeliveryZoneRequest;
import ru.florify.delivery.application.command.CreateDeliveryZoneCommand;
import ru.florify.delivery.application.command.UpdateDeliveryZoneCommand;
import ru.florify.delivery.domain.model.DeliveryZone;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface DeliveryZoneWebMapper {

    @Mapping(target = "performerId", source = "performerId")
    CreateDeliveryZoneCommand toCommand(CreateDeliveryZoneRequest request, UUID performerId);

    @Mapping(target = "zoneId", source = "id")
    @Mapping(target = "performerId", source = "performerId")
    UpdateDeliveryZoneCommand toCommand(UpdateDeliveryZoneRequest request, UUID id, UUID performerId);

    DeliveryZoneResponse toResponse(DeliveryZone zone);
}
