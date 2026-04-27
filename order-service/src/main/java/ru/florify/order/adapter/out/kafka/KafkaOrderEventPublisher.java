package ru.florify.order.adapter.out.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import ru.florify.order.application.port.out.OrderEventPublisher;

import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaOrderEventPublisher implements OrderEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publish(String topic, String key, Object payload) {
        try {
            kafkaTemplate.send(topic, key, payload).get(10, TimeUnit.SECONDS);
            log.debug("Published event to topic={}, key={}", topic, key);
        } catch (Exception e) {
            log.error("Failed to publish event to topic={}, key={}", topic, key, e);
            throw new RuntimeException("Kafka publish failed", e);
        }
    }
}
