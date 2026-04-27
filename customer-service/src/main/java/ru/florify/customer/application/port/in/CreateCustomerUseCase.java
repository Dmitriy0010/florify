package ru.florify.customer.application.port.in;

import ru.florify.customer.application.command.CreateCustomerCommand;
import ru.florify.customer.domain.model.Customer;

/**
 * Use case for creating a new customer profile.
 * Initializes the loyalty account and sets up initial customer preferences.
 */
public interface CreateCustomerUseCase {
    Customer execute(CreateCustomerCommand command);
}
