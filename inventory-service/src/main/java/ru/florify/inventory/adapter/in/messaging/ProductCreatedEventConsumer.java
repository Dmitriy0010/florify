package ru.florify.inventory.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import ru.florify.catalog.domain.event.ProductCreatedEvent;
import ru.florify.inventory.application.port.out.ProductSnapshotRepository;
import ru.florify.inventory.domain.model.ProductSnapshot;

import java.time.Clock;
import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductCreatedEventConsumer {

    private final ProductSnapshotRepository repository;
    private final Clock clock;

    @KafkaListener(topics = "catalog.product.created", groupId = "inventory-service")
    public void consume(ProductCreatedEvent event) {
        log.info("Consuming ProductCreatedEvent: productId={}, sku={}", event.productId(), event.sku());

        ProductSnapshot snapshot = ProductSnapshot.builder()
                .productId(event.productId())
                .name(event.name())
                .sku(event.sku())
                .unit(event.unit())
                .defaultShelfLifeDays(event.defaultShelfLifeDays())
                .active(true)
                .lastSyncedAt(Instant.now(clock))
                .build();

        repository.save(snapshot);
    }
}
