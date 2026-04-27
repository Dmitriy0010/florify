package ru.florify.order.adapter.in.web.mapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.order.adapter.in.web.dto.CreateOrderRequest;
import ru.florify.order.adapter.in.web.dto.OrderItemDto;
import ru.florify.order.adapter.in.web.dto.OrderKanbanResponse;
import ru.florify.order.adapter.in.web.dto.OrderResponse;
import ru.florify.order.adapter.in.web.dto.UpdateOrderStatusRequest;
import ru.florify.order.application.command.CreateOrderCommand;
import ru.florify.order.application.command.UpdateOrderStatusCommand;
import ru.florify.order.domain.model.Order;
import ru.florify.order.domain.model.OrderItem;
import ru.florify.order.domain.model.OrderKanbanItem;
import ru.florify.order.domain.model.OrderSource;
import ru.florify.order.domain.model.OrderStatus;
import ru.florify.order.domain.model.OrderType;
import ru.florify.order.domain.model.PaymentMethod;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-27T12:25:57+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class OrderWebMapperImpl implements OrderWebMapper {

    @Override
    public CreateOrderCommand toCommand(CreateOrderRequest request, UUID customerId, String idempotencyKey) {
        if ( request == null && customerId == null && idempotencyKey == null ) {
            return null;
        }

        List<OrderItem> items = null;
        OrderType type = null;
        OrderSource source = null;
        PaymentMethod paymentMethod = null;
        String guestPhone = null;
        String guestName = null;
        int bonusPointsUsed = 0;
        if ( request != null ) {
            items = orderItemDtoListToOrderItemList( request.items() );
            type = request.type();
            source = request.source();
            paymentMethod = request.paymentMethod();
            guestPhone = request.guestPhone();
            guestName = request.guestName();
            if ( request.bonusPointsUsed() != null ) {
                bonusPointsUsed = request.bonusPointsUsed().intValue();
            }
        }
        UUID customerId1 = null;
        customerId1 = customerId;
        String idempotencyKey1 = null;
        idempotencyKey1 = idempotencyKey;

        CreateOrderCommand createOrderCommand = new CreateOrderCommand( customerId1, guestPhone, guestName, items, bonusPointsUsed, type, source, paymentMethod, idempotencyKey1 );

        return createOrderCommand;
    }

    @Override
    public UpdateOrderStatusCommand toCommand(UpdateOrderStatusRequest request, UUID orderId) {
        if ( request == null && orderId == null ) {
            return null;
        }

        OrderStatus newStatus = null;
        UUID floristId = null;
        if ( request != null ) {
            newStatus = request.status();
            floristId = request.floristId();
        }
        UUID orderId1 = null;
        orderId1 = orderId;

        UUID eventId = java.util.UUID.randomUUID();

        UpdateOrderStatusCommand updateOrderStatusCommand = new UpdateOrderStatusCommand( eventId, orderId1, newStatus, floristId );

        return updateOrderStatusCommand;
    }

    @Override
    public OrderResponse toResponse(Order domain) {
        if ( domain == null ) {
            return null;
        }

        boolean isPaid = false;
        UUID id = null;
        String orderNumber = null;
        UUID customerId = null;
        OrderStatus status = null;
        List<OrderItemDto> items = null;
        BigDecimal totalAmount = null;
        BigDecimal discountAmount = null;
        BigDecimal bonusPointsUsed = null;
        BigDecimal finalAmount = null;
        OrderType type = null;
        OrderSource source = null;
        PaymentMethod paymentMethod = null;
        Instant createdAt = null;
        Instant updatedAt = null;

        isPaid = domain.isPaid();
        id = domain.getId();
        orderNumber = domain.getOrderNumber();
        customerId = domain.getCustomerId();
        status = domain.getStatus();
        items = orderItemListToOrderItemDtoList( domain.getItems() );
        totalAmount = domain.getTotalAmount();
        discountAmount = domain.getDiscountAmount();
        bonusPointsUsed = BigDecimal.valueOf( domain.getBonusPointsUsed() );
        finalAmount = domain.getFinalAmount();
        type = domain.getType();
        source = domain.getSource();
        paymentMethod = domain.getPaymentMethod();
        createdAt = domain.getCreatedAt();
        updatedAt = domain.getUpdatedAt();

        OrderResponse orderResponse = new OrderResponse( id, orderNumber, customerId, status, items, totalAmount, discountAmount, bonusPointsUsed, finalAmount, type, source, paymentMethod, isPaid, createdAt, updatedAt );

        return orderResponse;
    }

    @Override
    public OrderKanbanResponse toResponse(OrderKanbanItem domain) {
        if ( domain == null ) {
            return null;
        }

        UUID id = null;
        String orderNumber = null;
        String status = null;
        BigDecimal finalAmount = null;
        Instant createdAt = null;

        id = domain.id();
        orderNumber = domain.orderNumber();
        status = domain.status();
        finalAmount = domain.finalAmount();
        createdAt = domain.createdAt();

        OrderKanbanResponse orderKanbanResponse = new OrderKanbanResponse( id, orderNumber, status, finalAmount, createdAt );

        return orderKanbanResponse;
    }

    protected OrderItem orderItemDtoToOrderItem(OrderItemDto orderItemDto) {
        if ( orderItemDto == null ) {
            return null;
        }

        UUID productId = null;
        String productName = null;
        BigDecimal quantity = null;
        BigDecimal unitPrice = null;
        BigDecimal lineTotal = null;

        productId = orderItemDto.productId();
        productName = orderItemDto.productName();
        quantity = orderItemDto.quantity();
        unitPrice = orderItemDto.unitPrice();
        lineTotal = orderItemDto.lineTotal();

        OrderItem orderItem = new OrderItem( productId, productName, quantity, unitPrice, lineTotal );

        return orderItem;
    }

    protected List<OrderItem> orderItemDtoListToOrderItemList(List<OrderItemDto> list) {
        if ( list == null ) {
            return null;
        }

        List<OrderItem> list1 = new ArrayList<OrderItem>( list.size() );
        for ( OrderItemDto orderItemDto : list ) {
            list1.add( orderItemDtoToOrderItem( orderItemDto ) );
        }

        return list1;
    }

    protected OrderItemDto orderItemToOrderItemDto(OrderItem orderItem) {
        if ( orderItem == null ) {
            return null;
        }

        UUID productId = null;
        String productName = null;
        BigDecimal quantity = null;
        BigDecimal unitPrice = null;
        BigDecimal lineTotal = null;

        productId = orderItem.productId();
        productName = orderItem.productName();
        quantity = orderItem.quantity();
        unitPrice = orderItem.unitPrice();
        lineTotal = orderItem.lineTotal();

        OrderItemDto orderItemDto = new OrderItemDto( productId, productName, quantity, unitPrice, lineTotal );

        return orderItemDto;
    }

    protected List<OrderItemDto> orderItemListToOrderItemDtoList(List<OrderItem> list) {
        if ( list == null ) {
            return null;
        }

        List<OrderItemDto> list1 = new ArrayList<OrderItemDto>( list.size() );
        for ( OrderItem orderItem : list ) {
            list1.add( orderItemToOrderItemDto( orderItem ) );
        }

        return list1;
    }
}
