package ru.florify.customer.adapter.in.kafka;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import ru.florify.customer.BaseIntegrationTest;
import ru.florify.customer.adapter.out.persistence.entity.CustomerJpaEntity;
import ru.florify.customer.adapter.out.persistence.repository.CustomerJpaRepository;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.awaitility.Awaitility.await;
import static org.assertj.core.api.Assertions.assertThat;

@EmbeddedKafka(partitions = 1, topics = {"auth.user.registered"})
class KafkaConsumersIT extends BaseIntegrationTest {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private CustomerJpaRepository customerRepository;

    @DynamicPropertySource
    static void kafkaProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.kafka.bootstrap-servers", () -> System.getProperty("spring.embedded.kafka.brokers"));
    }

    @Test
    @DisplayName("Should process UserRegisteredEvent and create customer")
    void shouldProcessUserRegisteredEvent() {
        // Given
        UUID userId = UUID.randomUUID();
        Map<String, Object> event = Map.of(
                "eventId", UUID.randomUUID().toString(),
                "userId", userId.toString(),
                "phone", "+79112223344",
                "email", "test@example.com",
                "firstName", "John",
                "lastName", "Smith",
                "role", "CUSTOMER",
                "occurredAt", Instant.now().toString()
        );

        // When
        kafkaTemplate.send("auth.user.registered", userId.toString(), event);

        // Then
        await().atMost(10, TimeUnit.SECONDS).untilAsserted(() -> {
            assertThat(customerRepository.findByUserId(userId)).isPresent();
        });
    }

    @Test
    @DisplayName("Idempotency: Same UserRegisteredEvent processed twice should not fail")
    void shouldBeIdempotent() {
        // Given
        UUID userId = UUID.randomUUID();
        String eventId = UUID.randomUUID().toString();
        Map<String, Object> event = Map.of(
                "eventId", eventId,
                "userId", userId.toString(),
                "phone", "+79112223355",
                "firstName", "Idem",
                "role", "CUSTOMER",
                "occurredAt", Instant.now().toString()
        );

        // When
        kafkaTemplate.send("auth.user.registered", userId.toString(), event);
        
        // Wait for first creation
        await().atMost(10, TimeUnit.SECONDS).untilAsserted(() -> {
            assertThat(customerRepository.findByUserId(userId)).isPresent();
        });

        // Send again
        kafkaTemplate.send("auth.users.registered", userId.toString(), event);

        // Then (No error, still one record)
        // Note: The interactor handles idempotency.
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
            long count = customerRepository.findAll().stream()
                    .filter(c -> c.getUserId() != null && c.getUserId().equals(userId))
                    .count();
            assertThat(count).isEqualTo(1);
        });
    }
}
