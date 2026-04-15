package ru.florify.catalog.infrastructure.scheduler;

import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.Scope;
import io.opentelemetry.context.propagation.TextMapGetter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.catalog.adapter.out.kafka.KafkaCatalogEventPublisher;
import ru.florify.catalog.adapter.out.persistence.entity.CatalogOutboxEventJpaEntity;
import ru.florify.catalog.adapter.out.persistence.repository.CatalogOutboxJpaRepository;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class CatalogOutboxRelayScheduler {

    private final CatalogOutboxJpaRepository CatalogOutboxJpaRepository;
    private final KafkaCatalogEventPublisher kafkaCatalogEventPublisher;
    private final Clock clock;

    /**
     * Polls unpublished events and sends them to Kafka.
     * Uses SKIP LOCKED for safe concurrent execution.
     */
    @Scheduled(fixedDelayString = "${app.outbox.relay-delay-ms:1000}")
    @Transactional
    public void relay() {
        // Limit batch size to 50
        List<CatalogOutboxEventJpaEntity> pending = CatalogOutboxJpaRepository.findPendingForUpdate(
                org.springframework.data.domain.PageRequest.of(0, 50)
        );
        
        if (pending.isEmpty()) return;

        log.debug("Relaying {} catalog events", pending.size());

        for (CatalogOutboxEventJpaEntity event : pending) {
            // Restore OTel context
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
                kafkaCatalogEventPublisher.publish(
                    event.getType(),
                    event.getAggregateId(),
                    event.getPayload(),
                    event.getMetadata()
                );

                markSent(event.getId());
            } catch (Exception e) {
                log.error("Failed to relay catalog event {}: {}", event.getId(), e.getMessage());
                // Optionally mark as failed or just retry next time (SKIP LOCKED handles retries)
            }
        }
    }

    private void markSent(UUID eventId) {
        CatalogOutboxJpaRepository.findById(eventId).ifPresent(e -> {
            e.setStatus("SENT");
            e.setSentAt(Instant.now(clock));
            CatalogOutboxJpaRepository.save(e);
        });
    }

    /**
     * Nightly cleanup of sent events.
     */
    @Scheduled(cron = "${app.outbox.cleanup-cron:0 0 3 * * *}")
    @Transactional
    public void cleanup() {
        Instant threshold = Instant.now(clock).minus(3, ChronoUnit.DAYS);
        CatalogOutboxJpaRepository.deletePublishedBefore(threshold);
        log.info("Cleaned up catalog outbox events older than {}", threshold);
    }
}
