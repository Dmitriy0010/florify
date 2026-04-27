package ru.florify.catalog.application.port.in;

import ru.florify.catalog.domain.model.Product;
import java.util.UUID;

public interface ActivateProductUseCase {
    Product execute(UUID productId, UUID performerId);
}
