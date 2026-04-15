package ru.florify.catalog.application.port.in;

import ru.florify.catalog.application.command.CreateProductCommand;
import ru.florify.catalog.domain.model.Product;

public interface CreateProductUseCase {
    Product execute(CreateProductCommand command);
}
