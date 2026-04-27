package ru.florify.delivery.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.delivery.adapter.in.web.dto.CreateDeliverySlotRequest;
import ru.florify.delivery.adapter.in.web.dto.DeliverySlotResponse;
import ru.florify.delivery.adapter.in.web.dto.UpdateDeliverySlotRequest;
import ru.florify.delivery.application.command.CreateDeliverySlotCommand;
import ru.florify.delivery.application.command.UpdateDeliverySlotCommand;
import ru.florify.delivery.domain.model.DeliverySlot;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface DeliverySlotWebMapper {

    CreateDeliverySlotCommand toCommand(CreateDeliverySlotRequest request, UUID performerId);

    @Mapping(target = "slotId", source = "id")
    UpdateDeliverySlotCommand toCommand(UpdateDeliverySlotRequest request, UUID id, UUID performerId);

    @Mapping(target = "isFull", expression = "java(slot.isFull())")
    DeliverySlotResponse toResponse(DeliverySlot slot);
}
