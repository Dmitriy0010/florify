package ru.florify.supplier.adapter.out.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import ru.florify.supplier.application.port.out.SupplierEventPublisher;

import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaSupplierEventPublisher implements SupplierEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publish(String topic, String key, Object payload) {
        try {
            kafkaTemplate.send(topic, key, payload).get(10, TimeUnit.SECONDS);
            log.debug("Published supplier event to topic={}, key={}", topic, key);
        } catch (Exception e) {
            log.error("Failed to publish supplier event to topic={}, key={}", topic, key, e);
            throw new RuntimeException("Kafka publish failed", e);
        }
    }
}
