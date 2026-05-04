package ru.florify.order.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import ru.florify.common.event.OrderCreatedEvent;
import ru.florify.order.application.command.CreateOrderCommand;
import ru.florify.order.application.port.out.OrderEventPublisher;
import ru.florify.order.application.port.out.OrderNumberGenerator;
import ru.florify.order.application.port.out.OrderRepository;
import ru.florify.order.domain.model.*;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreateOrderInteractorTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderEventPublisher eventPublisher;
    @Mock
    private OrderNumberGenerator orderNumberGenerator;
    @Mock
    private ApplicationEventPublisher applicationEventPublisher;
    @Mock
    private Clock clock;

    @InjectMocks
    private CreateOrderInteractor interactor;

    private final Instant fixedNow = Instant.parse("2026-04-10T10:00:00Z");

    @BeforeEach
    void setUp() {
        lenient().when(clock.instant()).thenReturn(fixedNow);
        lenient().when(clock.getZone()).thenReturn(ZoneId.of("UTC"));
    }

    @Test
    @DisplayName("Should successfully create order and publish event")
    void shouldCreateOrderAndPublishEvent() {
        // Given
        CreateOrderCommand command = new CreateOrderCommand(
                UUID.randomUUID(),       // customerId
                UUID.randomUUID(),       // storeId
                null,                    // guestPhone
                null,                    // guestName
                List.of(),               // items
                0,                       // bonusPointsUsed
                OrderType.PICKUP,        // type
                OrderSource.WEB,         // source
                PaymentMethod.CASH,      // paymentMethod
                "idemp-123",             // idempotencyKey
                null,                    // status
                null,                    // deliveryAddress
                null,                    // deliverySlotId
                null                     // deliveryZoneId
        );

        when(orderNumberGenerator.next()).thenReturn("ORD-123");
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Order result = interactor.execute(command);

        // Then
        assertNotNull(result);
        assertEquals("ORD-123", result.getOrderNumber());
        assertEquals("idemp-123", result.getIdempotencyKey());
        assertEquals(OrderStatus.PENDING_STOCK, result.getStatus());

        verify(orderRepository).save(any(Order.class));

        // Verify Kafka publish
        verify(eventPublisher).publish(eq("orders.order.created"), eq(result.getId().toString()), any(OrderCreatedEvent.class));
        
        // Verify Spring internal event publish
        verify(applicationEventPublisher).publishEvent(any(OrderCreatedEvent.class));
    }
}
