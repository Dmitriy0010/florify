package ru.florify.customer.application.port.in;

import ru.florify.customer.application.command.UpdateCustomerCommand;
import ru.florify.customer.domain.model.Customer;

public interface UpdateCustomerUseCase {
    Customer execute(UpdateCustomerCommand command);
}
