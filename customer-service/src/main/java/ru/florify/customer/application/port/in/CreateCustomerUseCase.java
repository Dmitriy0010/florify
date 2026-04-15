package ru.florify.customer.application.port.in;

import ru.florify.customer.application.command.CreateCustomerCommand;
import ru.florify.customer.domain.model.Customer;

public interface CreateCustomerUseCase {
    Customer execute(CreateCustomerCommand command);
}
