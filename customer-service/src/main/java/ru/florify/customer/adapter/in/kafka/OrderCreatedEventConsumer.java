package ru.florify.customer.adapter.in.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import ru.florify.customer.application.command.ReservePointsCommand;
import ru.florify.customer.application.port.in.ReservePointsUseCase;
import ru.florify.order.domain.event.OrderCreatedEvent;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCreatedEventConsumer {

    private final ReservePointsUseCase reservePointsUseCase;

    @KafkaListener(topics = "orders.order.created", groupId = "customer-service")
    public void consume(OrderCreatedEvent event, Acknowledgment ack) {
        log.info("Consumed OrderCreatedEvent: {} for order: {}", event.eventId(), event.orderId());

        try {
            // Only proceed if points were actually used
            if (event.bonusPointsUsed() > 0) {
                reservePointsUseCase.execute(new ReservePointsCommand(
                    event.customerId(),
                    event.orderId(),
                    event.bonusPointsUsed(),
                    event.eventId() // Idempotency key
                ));
            } else {
                log.debug("No points used in order {}. Skipping reservation.", event.orderId());
            }

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process OrderCreatedEvent: {}", event.eventId(), e);
        }
    }
}
