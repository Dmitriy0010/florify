package ru.florify.order.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.order.adapter.in.web.dto.CreateOrderRequest;
import ru.florify.order.adapter.in.web.dto.OrderKanbanResponse;
import ru.florify.order.adapter.in.web.dto.OrderResponse;
import ru.florify.order.adapter.in.web.dto.UpdateOrderStatusRequest;
import ru.florify.order.application.command.CreateOrderCommand;
import ru.florify.order.application.command.UpdateOrderStatusCommand;
import ru.florify.order.domain.model.Order;
import ru.florify.order.domain.model.OrderKanbanItem;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface OrderWebMapper {

    @Mapping(target = "customerId", source = "customerId")
    @Mapping(target = "idempotencyKey", source = "idempotencyKey")
    @Mapping(target = "items", source = "request.items")
    @Mapping(target = "type", source = "request.type")
    @Mapping(target = "source", source = "request.source")
    @Mapping(target = "paymentMethod", source = "request.paymentMethod")
    @Mapping(target = "guestPhone", source = "request.guestPhone")
    @Mapping(target = "guestName", source = "request.guestName")
    @Mapping(target = "bonusPointsUsed", source = "request.bonusPointsUsed")
    CreateOrderCommand toCommand(CreateOrderRequest request, UUID customerId, String idempotencyKey);

    @Mapping(target = "orderId", source = "orderId")
    @Mapping(target = "newStatus", source = "request.status")
    @Mapping(target = "floristId", source = "request.floristId")
    @Mapping(target = "eventId", expression = "java(java.util.UUID.randomUUID())")
    UpdateOrderStatusCommand toCommand(UpdateOrderStatusRequest request, UUID orderId);

    @Mapping(target = "isPaid", source = "paid")
    OrderResponse toResponse(Order domain);

    OrderKanbanResponse toResponse(OrderKanbanItem domain);
}
