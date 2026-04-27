package ru.florify.catalog.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.catalog.application.command.CreateProductCommand;
import ru.florify.catalog.application.port.in.CreateProductUseCase;
import ru.florify.catalog.application.port.out.CatalogEventPublisher;
import ru.florify.catalog.application.port.out.ProductRepository;
import ru.florify.catalog.domain.event.ProductCreatedEvent;
import ru.florify.catalog.domain.model.Product;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateProductInteractor implements CreateProductUseCase {

    private final ProductRepository productRepository;
    private final CatalogEventPublisher catalogEventPublisher;
    private final Clock clock;

    @Override
    public Product execute(CreateProductCommand command) {
        Instant now = Instant.now(clock);

        // Simple SKU generation as suggested in the doc
        String sku = "SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        if (productRepository.existsBySku(sku)) {
            // Very unlikely with UUID part, but still
            sku = "SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        Product product = Product.builder()
            .id(UUID.randomUUID())
            .sku(sku)
            .name(command.name())
            .description(command.description())
            .categoryId(command.categoryId())
            .unit(command.unit())
            .currentPrice(command.initialPrice())
            .imageUrl(command.imageUrl())
            .defaultShelfLifeDays(command.defaultShelfLifeDays())
            .active(true)
            .createdAt(now)
            .updatedAt(now)
            .build();

        Product saved = productRepository.save(product);

        catalogEventPublisher.publish(
            "catalog.product.created",
            saved.getId().toString(),
            ProductCreatedEvent.from(saved, now),
            Map.of()
        );

        return saved;
    }
}
