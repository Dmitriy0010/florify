package ru.florify.order.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.event.OrderCogsCalculatedSpringEvent;
import ru.florify.order.application.port.out.OrderRepository;
import ru.florify.order.domain.model.Order;

/**
 * Слушатель событий расчета себестоимости заказа от inventory-service.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCogsCalculatedEventConsumer {

    private final OrderRepository orderRepository;

    @Async
    @EventListener
    @Transactional
    public void onCogsCalculated(OrderCogsCalculatedSpringEvent event) {
        log.info("Received OrderCogsCalculatedSpringEvent for order {}: {}", event.orderId(), event.totalCogs());

        orderRepository.findByIdWithItems(event.orderId()).ifPresentOrElse(order -> {
            // В реальном приложении здесь можно использовать отдельный use case
            // Но для обновления тех. поля в monolith допустимо напрямую через репозиторий
            Order updatedOrder = order.toBuilder()
                    .totalCogs(event.totalCogs())
                    .build();
            orderRepository.save(updatedOrder);
            log.info("Order {} totalCogs updated to {}", event.orderId(), event.totalCogs());
        }, () -> log.warn("Order {} not found for COGS update", event.orderId()));
    }
}
