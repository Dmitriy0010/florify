package ru.florify.customer.application.port.out;

import ru.florify.customer.domain.model.Customer;
import java.util.Optional;
import java.util.UUID;

public interface CustomerCachePort {
    Optional<Customer> get(UUID customerId);
    void put(UUID customerId, Customer customer);
    void evict(UUID customerId);              // Called on updates
}
