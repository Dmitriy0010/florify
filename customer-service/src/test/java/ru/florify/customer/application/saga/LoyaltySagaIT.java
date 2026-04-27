package ru.florify.customer.application.saga;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import ru.florify.customer.BaseIntegrationTest;
import ru.florify.customer.adapter.out.persistence.entity.CustomerJpaEntity;
import ru.florify.customer.adapter.out.persistence.entity.LoyaltyAccountJpaEntity;
import ru.florify.customer.adapter.out.persistence.repository.CustomerJpaRepository;
import ru.florify.customer.adapter.out.persistence.repository.LoyaltyAccountJpaRepository;
import ru.florify.customer.domain.enums.CustomerSource;
import ru.florify.customer.domain.enums.LoyaltyTier;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.awaitility.Awaitility.await;
import static org.assertj.core.api.Assertions.assertThat;

@EmbeddedKafka(partitions = 1, topics = {"orders.created", "customers.loyalty.points_reserved"})
class LoyaltySagaIT extends BaseIntegrationTest {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private LoyaltyAccountJpaRepository loyaltyAccountRepository;

    @Autowired
    private CustomerJpaRepository customerRepository;

    @DynamicPropertySource
    static void kafkaProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.kafka.bootstrap-servers", () -> System.getProperty("spring.embedded.kafka.brokers"));
    }

    @Test
    @DisplayName("Saga Step 1: OrderCreated -> ReservePoints")
    void shouldProcessOrderCreatedAndReservePoints() {
        // Given
        UUID customerId = UUID.randomUUID();
        customerRepository.save(CustomerJpaEntity.builder()
                .id(customerId)
                .phone("+79998887766")
                .firstName("Alice")
                .source(CustomerSource.WEB)
                .active(true)
                .createdAt(Instant.now())
                .build());

        loyaltyAccountRepository.save(LoyaltyAccountJpaEntity.builder()
                .id(UUID.randomUUID())
                .customerId(customerId)
                .tier(LoyaltyTier.BRONZE)
                .pointsBalance(100)
                .reservedPoints(0)
                .totalSpent(BigDecimal.ZERO)
                .version(0)
                .createdAt(Instant.now())
                .build());

        Map<String, Object> orderCreatedEvent = Map.of(
                "eventId", UUID.randomUUID().toString(),
                "orderId", UUID.randomUUID().toString(),
                "customerId", customerId.toString(),
                "totalAmount", 1000.0,
                "bonusPointsUsed", 50, // Matches 'int' type from Phase 1.4 changes
                "occurredAt", Instant.now().toString()
        );

        // When
        kafkaTemplate.send("orders.created", customerId.toString(), orderCreatedEvent);

        // Then
        await().atMost(10, TimeUnit.SECONDS).untilAsserted(() -> {
            LoyaltyAccountJpaEntity account = loyaltyAccountRepository.findByCustomerId(customerId).orElseThrow();
            assertThat(account.getPointsBalance()).isEqualTo(100);
            assertThat(account.getReservedPoints()).isEqualTo(50);
        });
    }
}
