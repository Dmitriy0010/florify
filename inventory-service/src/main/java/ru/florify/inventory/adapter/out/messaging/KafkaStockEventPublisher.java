package ru.florify.inventory.adapter.out.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import ru.florify.inventory.application.port.out.EventPublisher;
import ru.florify.inventory.domain.event.StockExpiredEvent;
import ru.florify.inventory.domain.event.StockWrittenOffEvent;
import ru.florify.inventory.domain.event.StockReceivedEvent;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaStockEventPublisher implements EventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final Map<Class<?>, String> TOPIC_MAP = Map.of(
        StockWrittenOffEvent.class, "inventory.stock.written-off",
        StockExpiredEvent.class, "inventory.stock.expired",
        StockReceivedEvent.class, "inventory.stock.received"
    );

    @Override
    public void publish(Object event) {
        String topic = TOPIC_MAP.get(event.getClass());
        if (topic == null) {
            log.error("Unknown event type: {}", event.getClass());
            throw new IllegalArgumentException("Unknown event type: " + event.getClass());
        }
        
        log.info("Publishing {} to topic {}", event.getClass().getSimpleName(), topic);
        
        // Optimizing Kafka partitioning: use productId as key to ensure sequential processing per product
        String key = switch (event) {
            case StockWrittenOffEvent e -> e.productId().toString();
            case StockExpiredEvent e -> e.productId().toString();
            case StockReceivedEvent e -> e.productId().toString();
            default -> throw new IllegalArgumentException("Cannot extract key from: " + event.getClass());
        };
        
        kafkaTemplate.send(topic, key, event);
    }
}
