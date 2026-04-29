package ru.florify.order.domain.model;

import lombok.*;
import ru.florify.order.domain.exception.InvalidOrderStatusTransitionException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter(AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder(toBuilder = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Order {

    @EqualsAndHashCode.Include
    private UUID id;

    private String orderNumber;
    private String idempotencyKey;
    private UUID customerId;
    private String guestPhone;
    private String guestName;
    private OrderStatus status;
    private List<OrderItem> items;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalCogs;
    private int bonusPointsUsed;
    private BigDecimal finalAmount;
    private OrderType type;
    private OrderSource source;
    private PaymentMethod paymentMethod;
    private boolean isPaid;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID floristId;
    private UUID storeId;
    private String deliveryAddress;
    private UUID deliverySlotId;
    private UUID deliveryZoneId;
    private Payment currentPayment;

    // Фабричный метод для создания нового заказа
    public static Order createNew(
            UUID customerId,
            String guestPhone,
            String guestName,
            String orderNumber,
            String idempotencyKey,
            List<OrderItem> items,
            int bonusPointsUsed,
            OrderType type,
            OrderSource source,
            PaymentMethod paymentMethod,
            OrderStatus status,
            String deliveryAddress,
            UUID deliverySlotId,
            UUID deliveryZoneId,
            UUID storeId,
            Instant now
    ) {
        BigDecimal total = items.stream()
                .map(OrderItem::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal finalAmount = total.subtract(BigDecimal.valueOf(bonusPointsUsed));

        OrderStatus initialStatus = (status != null) ? status : 
            (source == OrderSource.POS ? OrderStatus.CONFIRMED : OrderStatus.PENDING_STOCK);

        boolean initialPaid = (initialStatus == OrderStatus.COMPLETED);

        return Order.builder()
                .id(UUID.randomUUID())
                .orderNumber(orderNumber)
                .idempotencyKey(idempotencyKey)
                .customerId(customerId)
                .guestPhone(guestPhone)
                .guestName(guestName)
                .status(initialStatus)
                .items(items)
                .totalAmount(total)
                .discountAmount(BigDecimal.ZERO)
                .bonusPointsUsed(bonusPointsUsed)
                .finalAmount(finalAmount)
                .type(type)
                .source(source)
                .paymentMethod(paymentMethod)
                .deliveryAddress(deliveryAddress)
                .deliverySlotId(deliverySlotId)
                .deliveryZoneId(deliveryZoneId)
                .storeId(storeId)
                .isPaid(initialPaid)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    // Доменная логика смены статуса
    public Order transitionToStatus(OrderStatus newStatus, Instant updatedAt) {
        if (!this.status.canTransitionTo(newStatus)) {
            throw new InvalidOrderStatusTransitionException(
                    "Cannot transition from " + this.status + " to " + newStatus
            );
        }

        Order updated = this.toBuilder()
                .status(newStatus)
                .updatedAt(updatedAt)
                .build();
        return updated;
    }

    public Order cancel(Instant updatedAt) {
        if (!this.status.canBeCancelled()) {
            throw new InvalidOrderStatusTransitionException(
                    "Cannot cancel order in status " + this.status
            );
        }

        return this.toBuilder()
                .status(OrderStatus.CANCELLED)
                .updatedAt(updatedAt)
                .build();
    }

    public Order complete(UUID floristId, Instant updatedAt) {
        // Use transitionToStatus to enforce domain rules (READY or OUT_FOR_DELIVERY -> COMPLETED)
        return this.transitionToStatus(OrderStatus.COMPLETED, updatedAt)
                .toBuilder()
                .floristId(floristId)
                .build();
    }

    public Order associatePayment(Payment payment, Instant updatedAt) {
        return this.toBuilder()
                .currentPayment(payment)
                .updatedAt(updatedAt)
                .build();
    }

    public Order markAsPaid(Instant updatedAt) {
        return this.toBuilder()
                .isPaid(true)
                .updatedAt(updatedAt)
                .build();
    }
}
