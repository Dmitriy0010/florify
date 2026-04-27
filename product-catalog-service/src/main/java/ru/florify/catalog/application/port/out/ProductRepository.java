package ru.florify.catalog.application.port.out;

import ru.florify.catalog.application.query.GetCatalogQuery;
import ru.florify.common.application.query.PagedResult;
import ru.florify.catalog.domain.model.Product;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository {
    Product save(Product product);
    Optional<Product> findById(UUID id);
    Optional<Product> findBySku(String sku);
    PagedResult<Product> findAll(GetCatalogQuery query);
    List<Product> findByCategoryId(UUID categoryId);     // For BulkPriceUpdate
    boolean existsBySku(String sku);
}
