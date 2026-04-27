package ru.florify.catalog.application.port.in;

import ru.florify.catalog.application.command.UpdateCategoryCommand;
import ru.florify.catalog.domain.model.ProductCategory;

public interface UpdateCategoryUseCase {
    ProductCategory execute(UpdateCategoryCommand command);
}
