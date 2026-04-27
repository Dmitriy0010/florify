package ru.florify.customer.application.port.out;

import ru.florify.customer.domain.model.Customer;
import ru.florify.customer.application.query.GetCustomerListQuery;
import ru.florify.common.application.query.PagedResult;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository {
    Customer save(Customer customer);
    Optional<Customer> findById(UUID id);
    Optional<Customer> findByPhone(String phone);
    Optional<Customer> findByUserId(UUID userId);     // Link check
    PagedResult<Customer> findAll(GetCustomerListQuery query, boolean includeArchived);
    List<Customer> findByBirthMonthAndDay(int month, int day);
}
