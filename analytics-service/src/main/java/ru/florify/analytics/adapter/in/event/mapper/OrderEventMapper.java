package ru.florify.analytics.adapter.in.event.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.analytics.application.command.ApplyCogsToOrderFactCommand;
import ru.florify.analytics.application.command.CancelOrderFactCommand;
import ru.florify.analytics.application.command.RecordOrderFactCommand;
import ru.florify.common.event.OrderCancelledSpringEvent;
import ru.florify.common.event.OrderCogsCalculatedSpringEvent;
import ru.florify.common.event.OrderCompletedSpringEvent;
import ru.florify.common.event.OrderCreatedEvent;
import ru.florify.common.event.OrderStatusChangedSpringEvent;

@Mapper(componentModel = "spring")
public interface OrderEventMapper {
    @Mapping(target = "totalAmount", source = "finalAmount")
    @Mapping(target = "completedAt", source = "occurredAt")
    @Mapping(target = "assignedEmployeeId", ignore = true)
    @Mapping(target = "orderSource", constant = "WEB")
    @Mapping(target = "itemCount", constant = "0")
    @Mapping(target = "storeId", source = "storeId")
    @Mapping(target = "status", constant = "COMPLETED")
    RecordOrderFactCommand toRecordCommand(OrderCompletedSpringEvent event);
    
    @Mapping(target = "completedAt", source = "occurredAt")
    @Mapping(target = "assignedEmployeeId", ignore = true)
    @Mapping(target = "status", constant = "NEW")
    @Mapping(target = "orderSource", source = "orderSource")
    @Mapping(target = "itemCount", source = "itemCount")
    @Mapping(target = "storeId", source = "storeId")
    RecordOrderFactCommand fromCreated(OrderCreatedEvent event);

    @Mapping(target = "cancellationReason", constant = "cancelled")
    @Mapping(target = "cancelledAt", source = "occurredAt")
    CancelOrderFactCommand toCancelCommand(OrderCancelledSpringEvent event);

    @Mapping(target = "cogsAmount", source = "totalCogs")
    ApplyCogsToOrderFactCommand toCogsCommand(OrderCogsCalculatedSpringEvent event);
}
