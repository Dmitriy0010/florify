package ru.florify.catalog.domain.exception;

import ru.florify.common.exception.NotFoundException;
import java.util.UUID;

public class ProductNotFoundException extends NotFoundException {
    public ProductNotFoundException(UUID id) {
        super("Product", id);
    }
}
