package ru.florify.customer.application.port.in;

import java.util.UUID;

public interface DeactivateCustomerUseCase {
    void execute(UUID id);
}
