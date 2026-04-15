package ru.florify.customer.application.port.in;

import ru.florify.customer.application.query.GetCustomerListQuery;
import ru.florify.common.application.query.PagedResult;
import ru.florify.customer.domain.model.Customer;

public interface GetCustomerListUseCase {
    PagedResult<Customer> execute(GetCustomerListQuery query);
}
