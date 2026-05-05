package ru.florify.delivery.adapter.in.web.mapper;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.delivery.adapter.in.web.dto.CreateDeliverySlotRequest;
import ru.florify.delivery.adapter.in.web.dto.DeliverySlotResponse;
import ru.florify.delivery.adapter.in.web.dto.UpdateDeliverySlotRequest;
import ru.florify.delivery.application.command.CreateDeliverySlotCommand;
import ru.florify.delivery.application.command.UpdateDeliverySlotCommand;
import ru.florify.delivery.domain.model.DeliverySlot;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:42+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class DeliverySlotWebMapperImpl implements DeliverySlotWebMapper {

    @Override
    public CreateDeliverySlotCommand toCommand(CreateDeliverySlotRequest request, UUID performerId) {
        if ( request == null && performerId == null ) {
            return null;
        }

        LocalDate date = null;
        LocalTime startTime = null;
        LocalTime endTime = null;
        int maxCapacity = 0;
        if ( request != null ) {
            date = request.date();
            startTime = request.startTime();
            endTime = request.endTime();
            maxCapacity = request.maxCapacity();
        }
        UUID performerId1 = null;
        performerId1 = performerId;

        CreateDeliverySlotCommand createDeliverySlotCommand = new CreateDeliverySlotCommand( date, startTime, endTime, maxCapacity, performerId1 );

        return createDeliverySlotCommand;
    }

    @Override
    public UpdateDeliverySlotCommand toCommand(UpdateDeliverySlotRequest request, UUID id, UUID performerId) {
        if ( request == null && id == null && performerId == null ) {
            return null;
        }

        LocalTime startTime = null;
        LocalTime endTime = null;
        int maxCapacity = 0;
        if ( request != null ) {
            startTime = request.startTime();
            endTime = request.endTime();
            maxCapacity = request.maxCapacity();
        }
        UUID slotId = null;
        slotId = id;
        UUID performerId1 = null;
        performerId1 = performerId;

        UpdateDeliverySlotCommand updateDeliverySlotCommand = new UpdateDeliverySlotCommand( slotId, startTime, endTime, maxCapacity, performerId1 );

        return updateDeliverySlotCommand;
    }

    @Override
    public DeliverySlotResponse toResponse(DeliverySlot slot) {
        if ( slot == null ) {
            return null;
        }

        UUID id = null;
        LocalDate date = null;
        LocalTime startTime = null;
        LocalTime endTime = null;
        int maxCapacity = 0;
        int currentLoad = 0;

        id = slot.getId();
        date = slot.getDate();
        startTime = slot.getStartTime();
        endTime = slot.getEndTime();
        maxCapacity = slot.getMaxCapacity();
        currentLoad = slot.getCurrentLoad();

        boolean isFull = slot.isFull();

        DeliverySlotResponse deliverySlotResponse = new DeliverySlotResponse( id, date, startTime, endTime, maxCapacity, currentLoad, isFull );

        return deliverySlotResponse;
    }
}
