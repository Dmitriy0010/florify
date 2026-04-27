package ru.florify.order.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.event.DeliveryTaskStatusChangedEvent;
import ru.florify.order.application.command.UpdateOrderStatusCommand;
import ru.florify.order.application.port.in.UpdateOrderStatusUseCase;
import ru.florify.order.domain.model.OrderStatus;

/**
 * Слушатель событий изменения статуса задачи доставки в delivery-service.
 * 
 * Синхронизирует статус заказа в зависимости от прогресса доставки.
 * Использует Spring ApplicationEvents для внутрипроцессного взаимодействия.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DeliveryTaskStatusChangedEventConsumer {

    private final UpdateOrderStatusUseCase updateOrderStatusUseCase;

    @Async
    @EventListener
    @Transactional
    public void handle(DeliveryTaskStatusChangedEvent event) {
        log.info("Received DeliveryTaskStatusChangedEvent: taskId={}, status={} -> {}", 
                event.taskId(), event.previousStatus(), event.newStatus());

        OrderStatus targetStatus = mapToOrderStatus(event.newStatus());
        
        if (targetStatus == null) {
            log.debug("No order status update required for delivery status: {}", event.newStatus());
            return;
        }

        try {
            updateOrderStatusUseCase.execute(new UpdateOrderStatusCommand(
                    event.taskId(), // Используем taskId как eventId для идемпотентности
                    event.orderId(),
                    targetStatus,
                    event.courierId() // Курьер выступает в роли исполнителя (floristId в контексте заказа)
            ));
            log.info("Order {} status updated to {} based on delivery task {}", 
                    event.orderId(), targetStatus, event.taskId());
        } catch (Exception e) {
            log.error("Failed to update order status for orderId={} from delivery event: {}", 
                    event.orderId(), e.getMessage());
        }
    }

    private OrderStatus mapToOrderStatus(String deliveryStatus) {
        return switch (deliveryStatus) {
            case "PICKED_UP" -> OrderStatus.OUT_FOR_DELIVERY;
            case "DELIVERED" -> OrderStatus.COMPLETED;
            default -> null; // Для CREATED, ASSIGNED, FAILED не меняем статус основного заказа автоматически (или логика сложнее)
        };
    }
}
