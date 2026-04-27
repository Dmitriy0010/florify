package ru.florify.auth.adapter.out.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import ru.florify.auth.application.port.out.AuthEventPublisher;
import ru.florify.common.event.UserRegisteredEvent;

import java.util.Map;

/**
 * Implementation of AuthEventPublisher using Kafka.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaEventPublisher implements AuthEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final Map<Class<?>, String> TOPIC_MAP = Map.of(
            UserRegisteredEvent.class, "auth.user.registered"
    );

    @Override
    public void publish(Object event) {
        String topic = TOPIC_MAP.get(event.getClass());
        if (topic == null) {
            log.error("Unknown event type: {}", event.getClass());
            throw new IllegalArgumentException("Unknown event type: " + event.getClass());
        }

        String routingKey = extractKey(event);

        log.info("Publishing event {} to topic {} with key {}", event.getClass().getSimpleName(), topic, routingKey);
        kafkaTemplate.send(topic, routingKey, event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish event {} to topic {}", event, topic, ex);
                    } else {
                        log.debug("Event published: {} to {}", event, topic);
                    }
                });
    }

    private String extractKey(Object event) {
        return switch (event) {
            case UserRegisteredEvent e -> e.userId().toString();
            default -> throw new IllegalArgumentException("Cannot extract key from event type: " + event.getClass());
        };
    }
}
