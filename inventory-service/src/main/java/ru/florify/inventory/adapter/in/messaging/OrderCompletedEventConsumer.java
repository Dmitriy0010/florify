package ru.florify.inventory.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import ru.florify.common.event.OrderCompletedSpringEvent;
import ru.florify.inventory.application.command.WriteOffCommand;
import ru.florify.inventory.application.port.in.WriteOffStockUseCase;
import ru.florify.inventory.domain.model.WriteOffReason;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCompletedEventConsumer {

    private final WriteOffStockUseCase writeOffStockUseCase;

    @Async
    @EventListener
    public void onOrderCompleted(OrderCompletedSpringEvent event) {
        log.info("Processing inventory write-off for completed order: {}", event.orderId());

        if (event.items() == null || event.items().isEmpty()) {
            log.warn("Order {} completed but has no items in event. Skipping write-off.", event.orderId());
            return;
        }

        for (OrderCompletedSpringEvent.ItemInfo item : event.items()) {
            try {
                WriteOffCommand command = new WriteOffCommand(
                        item.productId(),
                        event.storeId(),
                        item.quantity(),
                        WriteOffReason.SALE,
                        "Автоматическое списание при продаже (заказ " + event.orderId() + ")",
                        "order:" + event.orderId() + ":" + item.productId(), // Idempotency key
                        null // Performed by system
                );

                writeOffStockUseCase.execute(command);
                log.debug("Successfully wrote off {} units of product {} for order {}", 
                        item.quantity(), item.productId(), event.orderId());
            } catch (Exception e) {
                log.error("Failed to write off product {} for order {}: {}", 
                        item.productId(), event.orderId(), e.getMessage());
            }
        }
    }
}
