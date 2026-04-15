package ru.florify.customer.application.port.in;

import ru.florify.customer.domain.model.Customer;
import java.util.UUID;

public interface GetCustomerByIdUseCase {
    Customer execute(UUID customerId);
}
