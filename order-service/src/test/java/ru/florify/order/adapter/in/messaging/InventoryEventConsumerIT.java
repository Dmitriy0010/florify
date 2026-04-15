package ru.florify.order.adapter.in.messaging;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ActiveProfiles;
import ru.florify.order.application.command.UpdateOrderStatusCommand;
import ru.florify.order.application.port.in.UpdateOrderStatusUseCase;
import ru.florify.order.domain.event.InventoryRejectedEvent;
import ru.florify.order.domain.event.InventoryReservedEvent;
import ru.florify.order.domain.model.OrderStatus;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.awaitility.Awaitility.await;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@SpringBootTest(classes = {
    InventoryReservedEventConsumer.class,
    InventoryRejectedEventConsumer.class
}, properties = {
    "spring.kafka.consumer.auto-offset-reset=earliest",
    "spring.main.allow-bean-definition-overriding=true"
})
@org.springframework.boot.autoconfigure.ImportAutoConfiguration({
    org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration.class,
    org.springframework.boot.autoconfigure.validation.ValidationAutoConfiguration.class,
    org.springframework.boot.autoconfigure.jackson.JacksonAutoConfiguration.class
})
@ActiveProfiles("test")
@EmbeddedKafka(partitions = 1, topics = {"inventory.stock.reserved", "inventory.stock.rejected"})
class InventoryEventConsumerIT {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @MockBean
    private UpdateOrderStatusUseCase updateOrderStatusUseCase;
    
    // Minimal properties for JsonDeserializer if needed
    @org.springframework.test.context.DynamicPropertySource
    static void overrideProperties(org.springframework.test.context.DynamicPropertyRegistry registry) {
        registry.add("spring.kafka.bootstrap-servers", () -> System.getProperty("spring.embedded.kafka.brokers"));
        registry.add("spring.kafka.consumer.key-deserializer", () -> "org.apache.kafka.common.serialization.StringDeserializer");
        registry.add("spring.kafka.consumer.value-deserializer", () -> "org.springframework.kafka.support.serializer.JsonDeserializer");
        registry.add("spring.kafka.consumer.properties.spring.json.trusted.packages", () -> "ru.florify.*");
        registry.add("spring.kafka.producer.key-serializer", () -> "org.apache.kafka.common.serialization.StringSerializer");
        registry.add("spring.kafka.producer.value-serializer", () -> "org.springframework.kafka.support.serializer.JsonSerializer");
    }

    @Test
    @DisplayName("Should process InventoryReservedEvent and call use case")
    void shouldProcessReservedEvent() {
        // Given
        UUID eventId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        InventoryReservedEvent event = new InventoryReservedEvent(eventId, orderId, Instant.now());

        // When
        kafkaTemplate.send("inventory.stock.reserved", orderId.toString(), event);

        // Then
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
            verify(updateOrderStatusUseCase, times(1)).execute(argThat(command -> 
                command.eventId().equals(eventId) && 
                command.orderId().equals(orderId) && 
                command.newStatus() == OrderStatus.NEW
            ));
        });
    }

    @Test
    @DisplayName("Should process InventoryRejectedEvent and call use case")
    void shouldProcessRejectedEvent() {
        // Given
        UUID eventId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        InventoryRejectedEvent event = new InventoryRejectedEvent(eventId, orderId, "Out of stock", Instant.now());

        // When
        kafkaTemplate.send("inventory.stock.rejected", orderId.toString(), event);

        // Then
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
            verify(updateOrderStatusUseCase, times(1)).execute(argThat(command -> 
                command.eventId().equals(eventId) && 
                command.orderId().equals(orderId) && 
                command.newStatus() == OrderStatus.CANCELLED
            ));
        });
    }

    @Test
    @DisplayName("Idempotency: same eventId processed twice → Interactor called twice (idempotency handled there)")
    void shouldCallInteractorTwiceOnDuplicateEvent() {
        // NOTE: The consumer itself doesn't check idempotency anymore as per NEW-10 review.
        // It's the Interactor's job. So we verify that consumer RELAYS both events.
        
        // Given
        UUID eventId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        InventoryReservedEvent event = new InventoryReservedEvent(eventId, orderId, Instant.now());

        // When (Send twice)
        kafkaTemplate.send("inventory.stock.reserved", orderId.toString(), event);
        kafkaTemplate.send("inventory.stock.reserved", orderId.toString(), event);

        // Then
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
            verify(updateOrderStatusUseCase, times(2)).execute(any(UpdateOrderStatusCommand.class));
        });
    }
}
