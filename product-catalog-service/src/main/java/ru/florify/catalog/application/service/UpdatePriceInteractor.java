package ru.florify.catalog.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.catalog.application.command.UpdatePriceCommand;
import ru.florify.catalog.application.port.in.UpdatePriceUseCase;
import ru.florify.catalog.application.port.out.CatalogEventPublisher;
import ru.florify.catalog.application.port.out.ProductCachePort;
import ru.florify.catalog.application.port.out.ProductRepository;
import ru.florify.catalog.domain.event.ProductPriceChangedEvent;
import ru.florify.catalog.domain.exception.ProductNotFoundException;
import ru.florify.catalog.domain.model.Product;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class UpdatePriceInteractor implements UpdatePriceUseCase {

    private final ProductRepository productRepository;
    private final CatalogEventPublisher catalogEventPublisher;
    private final ProductCachePort cachePort;
    private final Clock clock;

    @Override
    public Product execute(UpdatePriceCommand command) {
        Product product = productRepository.findById(command.productId())
            .orElseThrow(() -> new ProductNotFoundException(command.productId()));

        BigDecimal oldPrice = product.getCurrentPrice();
        Instant now = Instant.now(clock);

        Product updated = product.updatePrice(command.newPrice(), now);
        productRepository.save(updated);

        // Invalidate cache
        cachePort.evict(product.getId());

        // Publish event
        catalogEventPublisher.publish(
            "catalog.product.price_changed",
            product.getId().toString(),
            ProductPriceChangedEvent.from(updated, oldPrice, now),
            Map.of()
        );

        return updated;
    }
}
