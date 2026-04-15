package ru.florify.inventory.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import ru.florify.catalog.domain.event.ProductDeactivatedEvent;
import ru.florify.inventory.application.port.out.ProductSnapshotRepository;

import java.time.Clock;
import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductDeactivatedEventConsumer {

    private final ProductSnapshotRepository repository;
    private final Clock clock;

    @KafkaListener(topics = "catalog.product.deactivated", groupId = "inventory-service")
    public void consume(ProductDeactivatedEvent event) {
        log.info("Consuming ProductDeactivatedEvent: productId={}, sku={}", event.productId(), event.sku());

        repository.findById(event.productId()).ifPresent(snapshot -> {
            var deactivated = snapshot.withActive(false)
                    .withLastSyncedAt(Instant.now(clock));
            repository.save(deactivated);
        });
    }
}
