package ru.florify.delivery.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.event.OrderStatusChangedSpringEvent;
import ru.florify.delivery.application.command.CreateDeliveryTaskCommand;
import ru.florify.delivery.application.port.in.CreateDeliveryTaskUseCase;
import ru.florify.delivery.application.port.out.DeliveryTaskRepository;

/**
 * Слушатель Spring Events от order-service.
 *
 * При переводе заказа в статус OUT_FOR_DELIVERY автоматически создаёт
 * задачу доставки через CreateDeliveryTaskUseCase.
 *
 * Принцип работы:
 * - order-service публикует OrderStatusChangedSpringEvent через ApplicationEventPublisher.
 * - delivery-service (в той же JVM) принимает событие через @EventListener.
 * - Никаких Kafka или HTTP-вызовов — чисто in-process коммуникация.
 *
 * @Async — событие обрабатывается в отдельном potoke (Virtual Thread),
 * не блокирует транзакцию order-service.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderStatusChangedEventConsumer {

    private final CreateDeliveryTaskUseCase createDeliveryTaskUseCase;
    private final DeliveryTaskRepository taskRepository;

    @Async
    @EventListener
    @Transactional
    public void handle(OrderStatusChangedSpringEvent event) {
        // Нас интересует только переход в OUT_FOR_DELIVERY
        if (!"OUT_FOR_DELIVERY".equals(event.newStatus())) {
            return;
        }

        log.info("OrderStatusChangedEvent received: orderId={} → OUT_FOR_DELIVERY", event.orderId());

        // POS/Pickup detection: if no address provided, it's not a delivery task candidate
        if (event.deliveryAddress() == null || event.deliveryAddress().isBlank() || "Address not provided".equals(event.deliveryAddress())) {
            log.info("Order {} has no delivery address (likely PICKUP or POS), skipping task creation", event.orderId());
            return;
        }

        // Идемпотентность: если задача уже была создана (например, вручную) — пропускаем
        if (taskRepository.existsByOrderId(event.orderId())) {
            log.info("Delivery task for orderId={} already exists, skipping auto-creation", event.orderId());
            return;
        }

        CreateDeliveryTaskCommand command = new CreateDeliveryTaskCommand(
                event.orderId(),
                null,                   // slotId — может быть назначен позже через REST
                null,                   // zoneId — может быть назначен позже
                event.deliveryAddress() != null ? event.deliveryAddress() : "Address not provided",
                null,                   // latitude — геокодирование на следующем шаге
                null,                   // longitude
                null,                   // estimatedArrival
                event.customerId()      // performerId (кто инициировал—клиент или система)
        );

        try {
            var task = createDeliveryTaskUseCase.execute(command);
            log.info("Auto-created delivery task {} for order {}", task.getId(), event.orderId());
        } catch (Exception e) {
            log.error("Failed to auto-create delivery task for orderId={}: {}", event.orderId(), e.getMessage());
        }
    }
}
