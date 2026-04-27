package ru.florify.order.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import ru.florify.order.application.command.UpdateOrderStatusCommand;
import ru.florify.order.application.port.in.UpdateOrderStatusUseCase;
import ru.florify.order.domain.event.InventoryReservedEvent;
import ru.florify.order.domain.model.OrderStatus;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryReservedEventConsumer {

    private final UpdateOrderStatusUseCase updateOrderStatusUseCase;

    @KafkaListener(topics = "inventory.stock.reserved", groupId = "${spring.kafka.consumer.group-id:order-service}")
    public void consume(InventoryReservedEvent event) {
        log.info("Received InventoryReservedEvent for order {}", event.orderId());

        try {
            updateOrderStatusUseCase.execute(
                    new UpdateOrderStatusCommand(event.eventId(), event.orderId(), OrderStatus.NEW, null)
            );
        } catch (Exception ex) {
            log.error("Failed to process InventoryReservedEvent: {}", ex.getMessage());
            throw ex;
        }
    }
}
