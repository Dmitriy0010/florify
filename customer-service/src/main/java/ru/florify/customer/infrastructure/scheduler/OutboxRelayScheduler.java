package ru.florify.customer.infrastructure.scheduler;

import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.Scope;
import io.opentelemetry.context.propagation.TextMapGetter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.adapter.out.kafka.KafkaEventPublisher;
import ru.florify.customer.adapter.out.persistence.entity.OutboxEventJpaEntity;
import ru.florify.customer.adapter.out.persistence.repository.OutboxEventJpaRepository;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component("customerOutboxRelayScheduler")
@RequiredArgsConstructor
public class OutboxRelayScheduler {

    private final OutboxEventJpaRepository OutboxEventJpaRepository;
    private final KafkaEventPublisher kafkaEventPublisher;
    private final Clock clock;

    /**
     * Polls unpublished events and sends them to Kafka.
     * Uses FOR UPDATE SKIP LOCKED to allow multiple instances to work in parallel safely.
     */
    @Scheduled(fixedDelayString = "${app.outbox.relay-delay-ms:1000}")
    @Transactional
    public void relay() {
        List<OutboxEventJpaEntity> pending = OutboxEventJpaRepository.findUnpublishedWithLock();
        if (pending.isEmpty()) return;

        log.debug("Found {} pending outbox events", pending.size());

        for (OutboxEventJpaEntity event : pending) {
            // Restore OTel context from trace headers
            Context parentContext = GlobalOpenTelemetry.getPropagators().getTextMapPropagator()
                .extract(Context.current(), event.getMetadata(), new TextMapGetter<Map<String, String>>() {
                    @Override
                    public Iterable<String> keys(Map<String, String> carrier) {
                        return carrier == null ? List.of() : carrier.keySet();
                    }

                    @Override
                    public String get(Map<String, String> carrier, String key) {
                        return carrier == null ? null : carrier.get(key);
                    }
                });

            try (Scope scope = parentContext.makeCurrent()) {
                // Send to Kafka
                kafkaEventPublisher.publish(
                    event.getType(),
                    event.getAggregateId(),
                    event.getPayload(),
                    event.getMetadata()
                );

                // Mark as published
                markPublished(event.getId());

            } catch (Exception e) {
                log.error("Failed to relay outbox event {}: {}", event.getId(), e.getMessage());
            }
        }
    }

    @Transactional
    public void markPublished(UUID eventId) {
        OutboxEventJpaRepository.findById(eventId).ifPresent(e -> {
            e.setSentAt(Instant.now(clock));
            e.setStatus("SENT");
            OutboxEventJpaRepository.save(e);
        });
    }

    /**
     * Nightly cleanup of published events (older than 7 days).
     */
    @Scheduled(cron = "${app.outbox.cleanup-cron:0 0 3 * * *}")
    @Transactional
    public void cleanup() {
        Instant threshold = Instant.now(clock).minus(7, ChronoUnit.DAYS);
        OutboxEventJpaRepository.deletePublishedBefore(threshold);
        log.info("Cleaned up outbox events older than {}", threshold);
    }
}

