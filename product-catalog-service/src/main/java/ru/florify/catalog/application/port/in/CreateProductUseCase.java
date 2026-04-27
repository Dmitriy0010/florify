package ru.florify.catalog.application.port.in;

import ru.florify.catalog.application.command.CreateProductCommand;
import ru.florify.catalog.domain.model.Product;

/**
 * Use case for adding a new product to the catalog.
 * Validates category existence, generates a unique SKU if not provided,
 * and publishes a notification upon successful creation.
 */
public interface CreateProductUseCase {
    Product execute(CreateProductCommand command);
}
