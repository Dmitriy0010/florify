package ru.florify.customer.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.command.UpdateCustomerCommand;
import ru.florify.customer.application.port.in.UpdateCustomerUseCase;
import ru.florify.customer.application.port.out.CustomerCachePort;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.model.Customer;

import java.time.Clock;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Transactional
public class UpdateCustomerInteractor implements UpdateCustomerUseCase {

    private final CustomerRepository customerRepository;
    private final CustomerCachePort cachePort;
    private final Clock clock;

    @Override
    public Customer execute(UpdateCustomerCommand command) {
        Customer customer = customerRepository.findById(command.customerId())
            .orElseThrow(() -> new CustomerNotFoundException(command.customerId()));

        Instant now = Instant.now(clock);

        Customer updated = customer
            .withEmail(command.email())
            .withFirstName(command.firstName())
            .withLastName(command.lastName())
            .withBirthDate(command.birthDate())
            .withGender(command.gender())
            .withUpdatedAt(now)
            // Use domain logic for tags replacement
            .updateTags(command.tags() != null ? command.tags() : customer.getTags(), now);

        Customer saved = customerRepository.save(updated);
        
        // Evict cache to ensure fresh data on next read
        cachePort.evict(command.customerId());
        
        return saved;
    }
}
