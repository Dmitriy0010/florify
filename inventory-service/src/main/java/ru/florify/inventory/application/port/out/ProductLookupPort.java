package ru.florify.inventory.application.port.out;

import ru.florify.inventory.domain.model.CatalogProduct;

import java.util.Optional;
import java.util.UUID;

public interface ProductLookupPort {
    Optional<CatalogProduct> findById(UUID id);
    java.util.List<CatalogProduct> findAll();
}
