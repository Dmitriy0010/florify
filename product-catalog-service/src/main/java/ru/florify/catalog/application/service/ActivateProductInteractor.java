package ru.florify.catalog.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.catalog.application.port.in.ActivateProductUseCase;
import ru.florify.catalog.application.port.out.CatalogEventPublisher;
import ru.florify.catalog.application.port.out.ProductCachePort;
import ru.florify.catalog.application.port.out.ProductRepository;
import ru.florify.catalog.domain.event.ProductActivatedEvent;
import ru.florify.catalog.domain.exception.ProductNotFoundException;
import ru.florify.catalog.domain.model.Product;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ActivateProductInteractor implements ActivateProductUseCase {

    private final ProductRepository productRepository;
    private final CatalogEventPublisher catalogEventPublisher;
    private final ProductCachePort cachePort;
    private final Clock clock;

    @Override
    public Product execute(UUID productId, UUID performerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        Instant now = Instant.now(clock);
        Product activated = product.activate(now);
        productRepository.save(activated);

        cachePort.evict(product.getId());

        catalogEventPublisher.publish(
                "catalog.product.activated",
                activated.getId().toString(),
                ProductActivatedEvent.from(activated, now),
                Map.of()
        );
        
        return activated;
    }
}
