package ru.florify.delivery.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.delivery.adapter.in.web.dto.AssignCourierRequest;
import ru.florify.delivery.adapter.in.web.dto.CreateDeliveryTaskRequest;
import ru.florify.delivery.adapter.in.web.dto.DeliveryTaskResponse;
import ru.florify.delivery.adapter.in.web.dto.UpdateTaskStatusRequest;
import ru.florify.delivery.application.command.AssignCourierCommand;
import ru.florify.delivery.application.command.CreateDeliveryTaskCommand;
import ru.florify.delivery.application.command.UpdateTaskStatusCommand;
import ru.florify.delivery.domain.model.DeliveryTask;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface DeliveryTaskWebMapper {

    CreateDeliveryTaskCommand toCommand(CreateDeliveryTaskRequest request, UUID performerId);

    @Mapping(target = "taskId", source = "taskId")
    @Mapping(target = "courierId", source = "request.courierId")
    AssignCourierCommand toCommand(UUID taskId, AssignCourierRequest request, UUID performerId);

    @Mapping(target = "taskId", source = "taskId")
    UpdateTaskStatusCommand toCommand(UUID taskId, UpdateTaskStatusRequest request, UUID performerId);

    DeliveryTaskResponse toResponse(DeliveryTask task);
}
