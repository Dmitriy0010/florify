package ru.florify.analytics.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.application.port.out.OrderFactRepository;
import ru.florify.common.event.OrderCompletedSpringEvent;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import java.util.concurrent.TimeUnit;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class OrderToAnalyticsFlowIT {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private OrderFactRepository orderFactRepository;

    @Test
    void shouldRecordOrderFactWhenOrderCompletedEventPublished() {
        // Given
        UUID orderId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID storeId = UUID.randomUUID();
        OrderCompletedSpringEvent event = OrderCompletedSpringEvent.of(
                orderId,
                customerId,
                storeId,
                new BigDecimal("1500.00"),
                new BigDecimal("1000.00"),
                java.util.Collections.emptyList(),
                Instant.now()
        );

        // When
        eventPublisher.publishEvent(event);

        // Then - using await because OrderEventListener might be @Async
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
            assertThat(orderFactRepository.findByOrderId(orderId)).isPresent();
        });
        
        var fact = orderFactRepository.findByOrderId(orderId).get();
        assertThat(fact.getTotalAmount()).isEqualByComparingTo("1500.00");
        assertThat(fact.getCogsAmount()).isEqualByComparingTo("1000.00");
    }
}
