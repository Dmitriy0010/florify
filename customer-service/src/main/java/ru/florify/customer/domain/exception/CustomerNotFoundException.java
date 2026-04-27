package ru.florify.customer.domain.exception;

import ru.florify.common.exception.NotFoundException;
import java.util.UUID;

public class CustomerNotFoundException extends NotFoundException {
    public CustomerNotFoundException(UUID id) {
        super("Customer", id);
    }
}
