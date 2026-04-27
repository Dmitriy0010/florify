package ru.florify.catalog.application.port.in;

import ru.florify.catalog.application.command.CreateCategoryCommand;
import ru.florify.catalog.domain.model.ProductCategory;

public interface CreateCategoryUseCase {
    ProductCategory execute(CreateCategoryCommand command);
}
