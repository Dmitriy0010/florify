package ru.florify.catalog.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.catalog.application.command.UpdateProductCommand;
import ru.florify.catalog.application.port.in.UpdateProductUseCase;
import ru.florify.catalog.application.port.out.CatalogEventPublisher;
import ru.florify.catalog.application.port.out.ProductRepository;
import ru.florify.catalog.domain.event.ProductUpdatedEvent;
import ru.florify.catalog.domain.exception.ProductNotFoundException;
import ru.florify.catalog.domain.model.Product;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class UpdateProductInteractor implements UpdateProductUseCase {

    private final ProductRepository productRepository;
    private final CatalogEventPublisher catalogEventPublisher;
    private final Clock clock;

    @Override
    public Product execute(UpdateProductCommand command) {
        Product product = productRepository.findById(command.productId())
                .orElseThrow(() -> new ProductNotFoundException(command.productId()));

        Instant now = Instant.now(clock);

        Product updated = product.update(
                command.name(),
                command.description(),
                command.categoryId(),
                command.imageUrl(),
                command.defaultShelfLifeDays(),
                now
        );

        productRepository.save(updated);

        catalogEventPublisher.publish(
                "catalog.product.updated",
                updated.getId().toString(),
                ProductUpdatedEvent.from(updated, now),
                Map.of()
        );

        return updated;
    }
}
