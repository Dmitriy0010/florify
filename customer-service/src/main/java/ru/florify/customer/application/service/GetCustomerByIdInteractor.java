package ru.florify.customer.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.port.in.GetCustomerByIdUseCase;
import ru.florify.customer.application.port.out.CustomerCachePort;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.model.Customer;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetCustomerByIdInteractor implements GetCustomerByIdUseCase {

    private final CustomerRepository customerRepository;
    private final CustomerCachePort cachePort;

    @Override
    public Customer execute(UUID customerId) {
        // Cache-aside: try cache first
        return cachePort.get(customerId).orElseGet(() -> {
            // If missed, go to DB
            Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(customerId));
            
            // Put in cache for next time
            cachePort.put(customerId, customer);
            
            return customer;
        });
    }
}
