package ru.florify.catalog.application.port.in;

import ru.florify.catalog.application.command.UpdateProductCommand;
import ru.florify.catalog.domain.model.Product;

public interface UpdateProductUseCase {
    Product execute(UpdateProductCommand command);
}
