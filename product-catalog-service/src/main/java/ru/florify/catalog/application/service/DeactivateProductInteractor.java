package ru.florify.catalog.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.catalog.application.command.DeactivateProductCommand;
import ru.florify.catalog.application.port.in.DeactivateProductUseCase;
import ru.florify.catalog.application.port.out.CatalogEventPublisher;
import ru.florify.catalog.application.port.out.ProductCachePort;
import ru.florify.catalog.application.port.out.ProductRepository;
import ru.florify.catalog.domain.event.ProductDeactivatedEvent;
import ru.florify.catalog.domain.exception.ProductNotFoundException;
import ru.florify.catalog.domain.model.Product;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class DeactivateProductInteractor implements DeactivateProductUseCase {

    private final ProductRepository productRepository;
    private final CatalogEventPublisher catalogEventPublisher;
    private final ProductCachePort cachePort;
    private final Clock clock;

    @Override
    public void execute(DeactivateProductCommand command) {
        Product product = productRepository.findById(command.productId())
                .orElseThrow(() -> new ProductNotFoundException(command.productId()));

        Instant now = Instant.now(clock);
        Product deactivated = product.deactivate(now);
        productRepository.save(deactivated);

        cachePort.evict(product.getId());

        catalogEventPublisher.publish(
                "catalog.product.deactivated",
                deactivated.getId().toString(),
                ProductDeactivatedEvent.from(deactivated, now),
                Map.of()
        );
    }
}
