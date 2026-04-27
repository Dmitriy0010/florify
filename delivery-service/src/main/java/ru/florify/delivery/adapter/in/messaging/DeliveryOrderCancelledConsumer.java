package ru.florify.delivery.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.event.OrderCancelledSpringEvent;
import ru.florify.delivery.application.port.out.DeliverySlotRepository;
import ru.florify.delivery.application.port.out.DeliveryTaskRepository;
import ru.florify.delivery.domain.model.DeliveryTask;

import java.time.Clock;
import java.time.Instant;

/**
 * Слушатель Spring Events от order-service — событие отмены заказа.
 *
 * При отмене заказа:
 * 1. Находим задачу доставки по orderId.
 * 2. Если задача не в финальном статусе — помечаем как FAILED ("Order cancelled").
 * 3. Освобождаем слот (если был привязан).
 *
 * Идемпотентно: если задача не найдена или уже финальная — ничего не делаем.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DeliveryOrderCancelledConsumer {

    private final DeliveryTaskRepository taskRepository;
    private final DeliverySlotRepository slotRepository;
    private final Clock clock;

    @Async
    @EventListener
    @Transactional
    public void handle(OrderCancelledSpringEvent event) {
        log.info("OrderCancelledSpringEvent received: orderId={}", event.orderId());

        taskRepository.findByOrderId(event.orderId()).ifPresentOrElse(task -> {
            if (task.getStatus().isFinal()) {
                log.info("Delivery task for orderId={} is already in final state {}, skipping",
                        event.orderId(), task.getStatus());
                return;
            }

            Instant now = Instant.now(clock);

            // Переводим в FAILED с причиной отмены заказа
            DeliveryTask failed = task.fail("Order was cancelled", now);
            taskRepository.save(failed);

            // Освобождаем слот если был привязан
            if (failed.getSlotId() != null) {
                slotRepository.findById(failed.getSlotId()).ifPresent(slot -> {
                    slot.release();
                    slotRepository.save(slot);
                    log.debug("Slot {} released due to order cancellation", failed.getSlotId());
                });
            }

            log.info("Delivery task {} marked as FAILED due to order cancellation (orderId={})",
                    failed.getId(), event.orderId());

        }, () -> log.debug("No delivery task found for cancelled orderId={}, nothing to do", event.orderId()));
    }
}
