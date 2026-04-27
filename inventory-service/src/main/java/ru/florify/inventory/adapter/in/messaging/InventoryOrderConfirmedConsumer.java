package ru.florify.inventory.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.event.OrderConfirmedEvent;
import ru.florify.inventory.application.command.WriteOffCommand;
import ru.florify.inventory.application.port.in.WriteOffStockUseCase;
import ru.florify.inventory.domain.model.WriteOffReason;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryOrderConfirmedConsumer {

    private final WriteOffStockUseCase writeOffUseCase;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    @KafkaListener(topics = "orders.order.confirmed", groupId = "inventory-service")
    @Transactional
    public void consume(ru.florify.common.event.OrderConfirmedEvent event) {
        log.info("Consuming OrderConfirmedEvent: orderId={}, storeId={}, items={}", 
                event.orderId(), event.storeId(), event.items().size());

        java.math.BigDecimal totalCogs = java.math.BigDecimal.ZERO;

        for (ru.florify.common.event.OrderConfirmedEvent.OrderItem item : event.items()) {
            java.math.BigDecimal itemCogs = writeOffUseCase.execute(new WriteOffCommand(
                    item.productId(),
                    event.storeId(), // Now passing storeId from the event
                    item.quantity(),
                    WriteOffReason.INVENTORY_LOSS,
                    "Automatic write-off by confirmed order",
                    "order:%s:%s".formatted(event.orderId(), item.productId()),
                    event.performerId()
            ));
            totalCogs = totalCogs.add(itemCogs);
        }

        log.info("Total COGS calculated for order {}: {}", event.orderId(), totalCogs);
        
        // Публикуем событие для order-service
        eventPublisher.publishEvent(ru.florify.common.event.OrderCogsCalculatedSpringEvent.of(
                event.orderId(),
                totalCogs,
                Instant.now()
        ));
    }
}

