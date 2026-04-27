package ru.florify.catalog.domain.exception;

import ru.florify.common.exception.NotFoundException;
import java.util.UUID;

public class CategoryNotFoundException extends NotFoundException {
    public CategoryNotFoundException(UUID id) {
        super("Category", id);
    }
}
