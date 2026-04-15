package ru.florify.customer.application.outbox;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.Instant;
import java.util.Map;

/**
 * OutboxEvent — infrastructure object in the Application layer.
 * Not a domain model. Stores events to be published to Kafka.
 */
@Getter
@Builder
@AllArgsConstructor
public class OutboxEvent {
    private final String topic;
    private final String aggregateId;
    private final Object payload;
    private final Instant createdAt;
    private final Map<String, String> traceHeaders;  // OTel propagation

    public static OutboxEvent create(String topic, String aggregateId,
                                     Object payload, Instant now,
                                     Map<String, String> traceHeaders) {
        return OutboxEvent.builder()
            .topic(topic)
            .aggregateId(aggregateId)
            .payload(payload)
            .createdAt(now)
            .traceHeaders(traceHeaders)
            .build();
    }
}
