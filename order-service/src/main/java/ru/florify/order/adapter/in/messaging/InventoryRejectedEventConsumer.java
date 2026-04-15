package ru.florify.order.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import ru.florify.order.adapter.out.persistence.repository.ProcessedMessageJpaRepository;
import ru.florify.order.application.command.UpdateOrderStatusCommand;
import ru.florify.order.application.port.in.UpdateOrderStatusUseCase;
import ru.florify.order.domain.event.InventoryRejectedEvent;
import ru.florify.order.domain.model.OrderStatus;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryRejectedEventConsumer {

    private final UpdateOrderStatusUseCase updateOrderStatusUseCase;
    private final ProcessedMessageJpaRepository processedMessageRepository;

    @KafkaListener(topics = "inventory.stock.rejected", groupId = "${spring.kafka.consumer.group-id:order-service}")
    public void consume(InventoryRejectedEvent event) {
        log.info("Received InventoryRejectedEvent for order {}. Reason: {}", event.orderId(), event.reason());

        if (processedMessageRepository.existsById(event.eventId())) {
            log.info("Duplicate event {}, skipping", event.eventId());
            return;
        }

        try {
            updateOrderStatusUseCase.execute(
                    new UpdateOrderStatusCommand(event.eventId(), event.orderId(), OrderStatus.CANCELLED, null)
            );
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            log.warn("Event {} already processed for order {}, skipping", event.eventId(), event.orderId());
        } catch (Exception ex) {
            log.error("Failed to process InventoryRejectedEvent: {}", ex.getMessage());
            throw ex;
        }
    }
}
