package ru.florify.order.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import ru.florify.order.domain.exception.InvalidOrderStatusTransitionException;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class OrderTest {

    private final Clock clock = Clock.fixed(Instant.parse("2026-04-10T10:00:00Z"), ZoneId.of("UTC"));

    @Test
    @DisplayName("Should create new order in PENDING_STOCK status with correct total amount")
    void shouldCreateNewOrder() {
        UUID customerId = UUID.randomUUID();
        List<OrderItem> items = List.of(
                new OrderItem(UUID.randomUUID(), "Rose", new BigDecimal("5"), new BigDecimal("100"), null),
                new OrderItem(UUID.randomUUID(), "Lily", new BigDecimal("2"), new BigDecimal("200"), null)
        );

        Order order = Order.createNew(
                customerId,
                null,
                null,
                "ORD-001",
                "idemp-001",
                items,
                50,                      // bonusPointsUsed (int)
                OrderType.DELIVERY,
                OrderSource.WEB,
                PaymentMethod.ONLINE,
                OrderStatus.PENDING_STOCK, // status
                "Test Address",          // deliveryAddress
                null,                    // deliverySlotId
                null,                    // deliveryZoneId
                UUID.randomUUID(),       // storeId
                Instant.now(clock)
        );

        assertEquals(OrderStatus.PENDING_STOCK, order.getStatus());
        assertEquals(new BigDecimal("900"), order.getTotalAmount()); // (5*100) + (2*200) = 500 + 400 = 900
        assertEquals(new BigDecimal("850"), order.getFinalAmount()); // 900 - 50 = 850
        assertFalse(order.isPaid());
        assertEquals(Instant.now(clock), order.getCreatedAt());
    }

    @Test
    @DisplayName("Should transition from PENDING_STOCK to NEW or CANCELLED")
    void shouldTransitionFromPendingStock() {
        Order order = createTestOrder(OrderStatus.PENDING_STOCK);

        Order nextOrder = order.transitionToStatus(OrderStatus.NEW, Instant.now(clock));
        assertEquals(OrderStatus.NEW, nextOrder.getStatus());

        Order cancelledOrder = order.cancel(Instant.now(clock));
        assertEquals(OrderStatus.CANCELLED, cancelledOrder.getStatus());
    }

    @Test
    @DisplayName("Should throw exception on invalid transition")
    void shouldThrowOnInvalidTransition() {
        Order order = createTestOrder(OrderStatus.COMPLETED);

        assertThrows(InvalidOrderStatusTransitionException.class, () ->
                order.transitionToStatus(OrderStatus.READY, Instant.now(clock))
        );

        assertThrows(InvalidOrderStatusTransitionException.class, () ->
                order.cancel(Instant.now(clock))
        );
    }

    @Test
    @DisplayName("Should allow cancellation from PENDING_STOCK")
    void shouldAllowCancellationFromPendingStock() {
        Order order = createTestOrder(OrderStatus.PENDING_STOCK);

        assertTrue(order.getStatus().canBeCancelled());
        assertDoesNotThrow(() -> order.cancel(Instant.now(clock)));
    }

    private Order createTestOrder(OrderStatus status) {
        return Order.builder()
                .id(UUID.randomUUID())
                .status(status)
                .items(List.of())
                .createdAt(Instant.now(clock))
                .updatedAt(Instant.now(clock))
                .build();
    }
}
