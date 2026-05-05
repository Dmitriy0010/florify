package ru.florify.delivery.adapter.in.web.mapper;

import java.time.Instant;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.delivery.adapter.in.web.dto.AssignCourierRequest;
import ru.florify.delivery.adapter.in.web.dto.CreateDeliveryTaskRequest;
import ru.florify.delivery.adapter.in.web.dto.DeliveryTaskResponse;
import ru.florify.delivery.adapter.in.web.dto.UpdateTaskStatusRequest;
import ru.florify.delivery.application.command.AssignCourierCommand;
import ru.florify.delivery.application.command.CreateDeliveryTaskCommand;
import ru.florify.delivery.application.command.UpdateTaskStatusCommand;
import ru.florify.delivery.domain.model.DeliveryTask;
import ru.florify.delivery.domain.model.TaskStatus;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:42+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class DeliveryTaskWebMapperImpl implements DeliveryTaskWebMapper {

    @Override
    public CreateDeliveryTaskCommand toCommand(CreateDeliveryTaskRequest request, UUID performerId) {
        if ( request == null && performerId == null ) {
            return null;
        }

        UUID orderId = null;
        UUID slotId = null;
        UUID zoneId = null;
        String deliveryAddress = null;
        Double latitude = null;
        Double longitude = null;
        Instant estimatedArrival = null;
        if ( request != null ) {
            orderId = request.orderId();
            slotId = request.slotId();
            zoneId = request.zoneId();
            deliveryAddress = request.deliveryAddress();
            latitude = request.latitude();
            longitude = request.longitude();
            estimatedArrival = request.estimatedArrival();
        }
        UUID performerId1 = null;
        performerId1 = performerId;

        CreateDeliveryTaskCommand createDeliveryTaskCommand = new CreateDeliveryTaskCommand( orderId, slotId, zoneId, deliveryAddress, latitude, longitude, estimatedArrival, performerId1 );

        return createDeliveryTaskCommand;
    }

    @Override
    public AssignCourierCommand toCommand(UUID taskId, AssignCourierRequest request, UUID performerId) {
        if ( taskId == null && request == null && performerId == null ) {
            return null;
        }

        UUID courierId = null;
        if ( request != null ) {
            courierId = request.courierId();
        }
        UUID taskId1 = null;
        taskId1 = taskId;
        UUID performerId1 = null;
        performerId1 = performerId;

        AssignCourierCommand assignCourierCommand = new AssignCourierCommand( taskId1, courierId, performerId1 );

        return assignCourierCommand;
    }

    @Override
    public UpdateTaskStatusCommand toCommand(UUID taskId, UpdateTaskStatusRequest request, UUID performerId) {
        if ( taskId == null && request == null && performerId == null ) {
            return null;
        }

        TaskStatus newStatus = null;
        String failureReason = null;
        if ( request != null ) {
            newStatus = request.newStatus();
            failureReason = request.failureReason();
        }
        UUID taskId1 = null;
        taskId1 = taskId;
        UUID performerId1 = null;
        performerId1 = performerId;

        UpdateTaskStatusCommand updateTaskStatusCommand = new UpdateTaskStatusCommand( taskId1, newStatus, failureReason, performerId1 );

        return updateTaskStatusCommand;
    }

    @Override
    public DeliveryTaskResponse toResponse(DeliveryTask task) {
        if ( task == null ) {
            return null;
        }

        UUID id = null;
        UUID orderId = null;
        UUID slotId = null;
        UUID zoneId = null;
        UUID courierId = null;
        String deliveryAddress = null;
        Double latitude = null;
        Double longitude = null;
        TaskStatus status = null;
        Instant estimatedArrival = null;
        Instant actualDeliveredAt = null;
        String failureReason = null;
        Instant createdAt = null;
        Instant updatedAt = null;

        id = task.getId();
        orderId = task.getOrderId();
        slotId = task.getSlotId();
        zoneId = task.getZoneId();
        courierId = task.getCourierId();
        deliveryAddress = task.getDeliveryAddress();
        latitude = task.getLatitude();
        longitude = task.getLongitude();
        status = task.getStatus();
        estimatedArrival = task.getEstimatedArrival();
        actualDeliveredAt = task.getActualDeliveredAt();
        failureReason = task.getFailureReason();
        createdAt = task.getCreatedAt();
        updatedAt = task.getUpdatedAt();

        DeliveryTaskResponse deliveryTaskResponse = new DeliveryTaskResponse( id, orderId, slotId, zoneId, courierId, deliveryAddress, latitude, longitude, status, estimatedArrival, actualDeliveredAt, failureReason, createdAt, updatedAt );

        return deliveryTaskResponse;
    }
}
