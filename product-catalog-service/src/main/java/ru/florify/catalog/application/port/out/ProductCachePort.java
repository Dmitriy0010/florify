package ru.florify.catalog.application.port.out;

import ru.florify.catalog.domain.model.Product;

import java.util.Optional;
import java.util.UUID;

public interface ProductCachePort {
    Optional<Product> get(UUID productId);
    void put(UUID productId, Product product);
    void evict(UUID productId);
}
