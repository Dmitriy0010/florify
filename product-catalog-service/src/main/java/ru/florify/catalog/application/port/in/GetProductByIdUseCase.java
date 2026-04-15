package ru.florify.catalog.application.port.in;

import ru.florify.catalog.domain.model.Product;
import java.util.UUID;

public interface GetProductByIdUseCase {
    Product execute(UUID id);
}
