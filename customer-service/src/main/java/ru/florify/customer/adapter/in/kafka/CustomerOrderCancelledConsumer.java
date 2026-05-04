package ru.florify.customer.adapter.in.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import ru.florify.customer.application.command.ReleasePointsCommand;
import ru.florify.customer.application.port.in.ReleasePointsUseCase;
import ru.florify.common.event.OrderCancelledEvent;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomerOrderCancelledConsumer {

    private final ReleasePointsUseCase releasePointsUseCase;

    @KafkaListener(topics = "orders.order.cancelled", groupId = "customer-service")
    public void consume(OrderCancelledEvent event) {
        log.info("Consumed OrderCancelledEvent: {} for order: {}", event.eventId(), event.orderId());

        try {
            // Only release if points were actually used
            if (event.bonusPointsUsed() > 0) {
                releasePointsUseCase.execute(new ReleasePointsCommand(
                    event.customerId(),
                    event.orderId(),
                    event.bonusPointsUsed()
                ));
            } else {
                log.debug("No points used in cancelled order {}. Nothing to release.", event.orderId());
            }
        } catch (Exception e) {
            log.error("Failed to process OrderCancelledEvent: {}", event.eventId(), e);
            throw e;
        }
    }

}
