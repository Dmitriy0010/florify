package ru.florify.catalog.application.port.out;

import ru.florify.catalog.domain.model.ProductCategory;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository {
    Optional<ProductCategory> findCategoryById(UUID id);
    List<ProductCategory> findAllActive();
    ProductCategory save(ProductCategory category);
}
