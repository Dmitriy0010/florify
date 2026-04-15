package ru.florify.customer.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.port.in.DeactivateCustomerUseCase;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.model.Customer;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DeactivateCustomerInteractor implements DeactivateCustomerUseCase {

    private final CustomerRepository customerRepository;
    private final Clock clock;

    @Override
    public void execute(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
        
        Customer deactivated = customer.deactivate(Instant.now(clock));
        customerRepository.save(deactivated);
    }
}
