package ru.florify.inventory;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;
import ru.florify.catalog.domain.event.ProductCreatedEvent;
import ru.florify.catalog.domain.event.ProductDeactivatedEvent;
import ru.florify.inventory.adapter.out.persistence.entity.ProductSnapshotJpaEntity;
import ru.florify.inventory.adapter.out.persistence.repository.ProductSnapshotJpaRepository;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

@EmbeddedKafka(partitions = 1, topics = {"catalog.product.created", "catalog.product.deactivated"})
@DirtiesContext
class InventorySnapshotIT extends BaseIntegrationTest {

    @Autowired private KafkaTemplate<String, Object> kafkaTemplate;
    @Autowired private ProductSnapshotJpaRepository repository;

    @Test
    void productCreatedEvent_shouldCreateSnapshot() throws Exception {
        UUID productId = UUID.randomUUID();
        ProductCreatedEvent event = new ProductCreatedEvent(
                UUID.randomUUID(),
                productId,
                "TEST-SKU-001",
                "Test Product",
                UUID.randomUUID(),
                BigDecimal.TEN,
                "PIECE",
                10,
                Instant.now()
        );

        kafkaTemplate.send("catalog.product.created", productId.toString(), event);

        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            var snapshot = repository.findById(productId);
            assertThat(snapshot).isPresent();
            assertThat(snapshot.get().getName()).isEqualTo("Test Product");
            assertThat(snapshot.get().getSku()).isEqualTo("TEST-SKU-001");
            assertThat(snapshot.get().isActive()).isTrue();
        });
    }

    @Test
    void productDeactivatedEvent_shouldUpdateSnapshot() throws Exception {
        // 1. Pre-create snapshot
        UUID productId = UUID.randomUUID();
        ProductSnapshotJpaEntity existing = ProductSnapshotJpaEntity.builder()
                .productId(productId)
                .name("Old Product")
                .sku("OLD-SKU")
                .unit("PIECE")
                .active(true)
                .lastSyncedAt(Instant.now())
                .build();
        repository.save(existing);

        // 2. Send deactivation event
        ProductDeactivatedEvent event = new ProductDeactivatedEvent(
                UUID.randomUUID(),
                productId,
                "OLD-SKU",
                Instant.now()
        );

        kafkaTemplate.send("catalog.product.deactivated", productId.toString(), event);

        // 3. Verify
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            var snapshot = repository.findById(productId);
            assertThat(snapshot).isPresent();
            assertThat(snapshot.get().isActive()).isFalse();
        });
    }
}
