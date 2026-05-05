package ru.florify.order.adapter.out.persistence.mapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import ru.florify.order.adapter.out.persistence.entity.OrderItemJpaEntity;
import ru.florify.order.adapter.out.persistence.entity.OrderJpaEntity;
import ru.florify.order.domain.model.Order;
import ru.florify.order.domain.model.OrderItem;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:53+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class OrderJpaMapperImpl implements OrderJpaMapper {

    @Autowired
    private OrderItemJpaMapper orderItemJpaMapper;
    @Autowired
    private PaymentJpaMapper paymentJpaMapper;

    @Override
    public OrderJpaEntity toEntity(Order domain) {
        if ( domain == null ) {
            return null;
        }

        OrderJpaEntity.OrderJpaEntityBuilder orderJpaEntity = OrderJpaEntity.builder();

        orderJpaEntity.isPaid( domain.isPaid() );
        orderJpaEntity.bonusPointsUsed( BigDecimal.valueOf( domain.getBonusPointsUsed() ) );
        orderJpaEntity.createdAt( domain.getCreatedAt() );
        orderJpaEntity.currentPayment( paymentJpaMapper.toEntity( domain.getCurrentPayment() ) );
        orderJpaEntity.customerId( domain.getCustomerId() );
        orderJpaEntity.deliveryAddress( domain.getDeliveryAddress() );
        orderJpaEntity.deliverySlotId( domain.getDeliverySlotId() );
        orderJpaEntity.deliveryZoneId( domain.getDeliveryZoneId() );
        orderJpaEntity.discountAmount( domain.getDiscountAmount() );
        orderJpaEntity.finalAmount( domain.getFinalAmount() );
        orderJpaEntity.floristId( domain.getFloristId() );
        orderJpaEntity.guestName( domain.getGuestName() );
        orderJpaEntity.guestPhone( domain.getGuestPhone() );
        orderJpaEntity.id( domain.getId() );
        orderJpaEntity.idempotencyKey( domain.getIdempotencyKey() );
        orderJpaEntity.items( orderItemListToOrderItemJpaEntityList( domain.getItems() ) );
        orderJpaEntity.orderNumber( domain.getOrderNumber() );
        orderJpaEntity.paymentMethod( domain.getPaymentMethod() );
        orderJpaEntity.source( domain.getSource() );
        orderJpaEntity.status( domain.getStatus() );
        orderJpaEntity.storeId( domain.getStoreId() );
        orderJpaEntity.totalAmount( domain.getTotalAmount() );
        orderJpaEntity.totalCogs( domain.getTotalCogs() );
        orderJpaEntity.type( domain.getType() );
        orderJpaEntity.updatedAt( domain.getUpdatedAt() );

        OrderJpaEntity orderJpaEntityResult = orderJpaEntity.build();

        linkOrderItems( orderJpaEntityResult );

        return orderJpaEntityResult;
    }

    @Override
    public Order toDomain(OrderJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        Order.OrderBuilder order = Order.builder();

        if ( entity.getIsPaid() != null ) {
            order.isPaid( entity.getIsPaid() );
        }
        if ( entity.getBonusPointsUsed() != null ) {
            order.bonusPointsUsed( entity.getBonusPointsUsed().intValue() );
        }
        order.createdAt( entity.getCreatedAt() );
        order.currentPayment( paymentJpaMapper.toDomain( entity.getCurrentPayment() ) );
        order.customerId( entity.getCustomerId() );
        order.deliveryAddress( entity.getDeliveryAddress() );
        order.deliverySlotId( entity.getDeliverySlotId() );
        order.deliveryZoneId( entity.getDeliveryZoneId() );
        order.discountAmount( entity.getDiscountAmount() );
        order.finalAmount( entity.getFinalAmount() );
        order.floristId( entity.getFloristId() );
        order.guestName( entity.getGuestName() );
        order.guestPhone( entity.getGuestPhone() );
        order.id( entity.getId() );
        order.idempotencyKey( entity.getIdempotencyKey() );
        order.items( orderItemJpaEntityListToOrderItemList( entity.getItems() ) );
        order.orderNumber( entity.getOrderNumber() );
        order.paymentMethod( entity.getPaymentMethod() );
        order.source( entity.getSource() );
        order.status( entity.getStatus() );
        order.storeId( entity.getStoreId() );
        order.totalAmount( entity.getTotalAmount() );
        order.totalCogs( entity.getTotalCogs() );
        order.type( entity.getType() );
        order.updatedAt( entity.getUpdatedAt() );

        return order.build();
    }

    @Override
    public Order toDomainWithoutItems(OrderJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        Order.OrderBuilder order = Order.builder();

        if ( entity.getIsPaid() != null ) {
            order.isPaid( entity.getIsPaid() );
        }
        if ( entity.getBonusPointsUsed() != null ) {
            order.bonusPointsUsed( entity.getBonusPointsUsed().intValue() );
        }
        order.createdAt( entity.getCreatedAt() );
        order.currentPayment( paymentJpaMapper.toDomain( entity.getCurrentPayment() ) );
        order.customerId( entity.getCustomerId() );
        order.deliveryAddress( entity.getDeliveryAddress() );
        order.deliverySlotId( entity.getDeliverySlotId() );
        order.deliveryZoneId( entity.getDeliveryZoneId() );
        order.discountAmount( entity.getDiscountAmount() );
        order.finalAmount( entity.getFinalAmount() );
        order.floristId( entity.getFloristId() );
        order.guestName( entity.getGuestName() );
        order.guestPhone( entity.getGuestPhone() );
        order.id( entity.getId() );
        order.idempotencyKey( entity.getIdempotencyKey() );
        order.orderNumber( entity.getOrderNumber() );
        order.paymentMethod( entity.getPaymentMethod() );
        order.source( entity.getSource() );
        order.status( entity.getStatus() );
        order.storeId( entity.getStoreId() );
        order.totalAmount( entity.getTotalAmount() );
        order.totalCogs( entity.getTotalCogs() );
        order.type( entity.getType() );
        order.updatedAt( entity.getUpdatedAt() );

        return order.build();
    }

    protected List<OrderItemJpaEntity> orderItemListToOrderItemJpaEntityList(List<OrderItem> list) {
        if ( list == null ) {
            return null;
        }

        List<OrderItemJpaEntity> list1 = new ArrayList<OrderItemJpaEntity>( list.size() );
        for ( OrderItem orderItem : list ) {
            list1.add( orderItemJpaMapper.toEntity( orderItem ) );
        }

        return list1;
    }

    protected List<OrderItem> orderItemJpaEntityListToOrderItemList(List<OrderItemJpaEntity> list) {
        if ( list == null ) {
            return null;
        }

        List<OrderItem> list1 = new ArrayList<OrderItem>( list.size() );
        for ( OrderItemJpaEntity orderItemJpaEntity : list ) {
            list1.add( orderItemJpaMapper.toDomain( orderItemJpaEntity ) );
        }

        return list1;
    }
}
