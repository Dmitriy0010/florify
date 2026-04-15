package ru.florify.inventory.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import ru.florify.catalog.domain.event.ProductUpdatedEvent;
import ru.florify.inventory.application.port.out.ProductSnapshotRepository;

import java.time.Clock;
import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductUpdatedEventConsumer {

    private final ProductSnapshotRepository repository;
    private final Clock clock;

    @KafkaListener(topics = "catalog.product.updated", groupId = "inventory-service")
    public void consume(ProductUpdatedEvent event) {
        log.info("Consuming ProductUpdatedEvent: productId={}, name={}", event.productId(), event.name());

        repository.findById(event.productId()).ifPresent(snapshot -> {
            var updated = snapshot.withName(event.name())
                    .withDefaultShelfLifeDays(event.defaultShelfLifeDays())
                    .withLastSyncedAt(Instant.now(clock));
            repository.save(updated);
        });
    }
}
