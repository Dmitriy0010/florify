package ru.florify.customer.adapter.in.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import ru.florify.customer.application.command.ConfirmPointsCommand;
import ru.florify.customer.application.port.in.ConfirmPointsUseCase;
import ru.florify.common.event.OrderCompletedEvent;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomerOrderCompletedConsumer {

    private final ConfirmPointsUseCase confirmPointsUseCase;

    @KafkaListener(topics = "orders.order.completed", groupId = "customer-service")
    public void consume(OrderCompletedEvent event) {
        log.info("Consumed OrderCompletedEvent for order: {}", event.orderId());

        if (event.customerId() == null) {
            log.info("Order {} was a guest checkout (customerId is null), skipping point confirmation", event.orderId());
            return;
        }

        try {
            confirmPointsUseCase.execute(new ConfirmPointsCommand(
                event.customerId(),
                event.orderId(),
                event.bonusPointsUsed(),
                event.finalAmount(),
                event.floristId()
            ));
        } catch (Exception e) {
            log.error("Failed to process OrderCompletedEvent for order: {}", event.orderId(), e);
            throw e;
        }
    }

}
