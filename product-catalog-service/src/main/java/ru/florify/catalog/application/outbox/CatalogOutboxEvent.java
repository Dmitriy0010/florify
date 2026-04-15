package ru.florify.catalog.application.outbox;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * CatalogOutboxEvent — infrastructure object in the Application layer.
 * Stores events to be published to Kafka.
 */
@Getter
@Builder
@AllArgsConstructor
public class CatalogOutboxEvent {
    private final UUID id;
    private final String topic;
    private final String aggregateId;
    private final Object payload;
    private final Instant createdAt;
    private final Map<String, String> traceHeaders;  // OTel propagation

    public static CatalogOutboxEvent create(String topic, String aggregateId,
                                     Object payload, Instant now,
                                     Map<String, String> traceHeaders) {
        return CatalogOutboxEvent.builder()
            .topic(topic)
            .aggregateId(aggregateId)
            .payload(payload)
            .createdAt(now)
            .traceHeaders(traceHeaders)
            .build();
    }
}
