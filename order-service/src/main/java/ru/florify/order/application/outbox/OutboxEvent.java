package ru.florify.order.application.outbox;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.With;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@With
@AllArgsConstructor
public class OutboxEvent {
    private final UUID id;
    private final String type;
    private final String aggregateId;
    private final Object payload;
    private final Instant createdAt;

    public String getTopic() {
        return type;
    }

    public String getKey() {
        return aggregateId;
    }

    public static OutboxEvent create(String type, String aggregateId, Object payload, Instant createdAt) {
        return OutboxEvent.builder()
                .id(UUID.randomUUID())
                .type(type)
                .aggregateId(aggregateId)
                .payload(payload)
                .createdAt(createdAt)
                .build();
    }
}
