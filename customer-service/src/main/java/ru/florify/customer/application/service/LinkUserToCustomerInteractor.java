package ru.florify.customer.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.command.LinkUserToCustomerCommand;
import ru.florify.customer.application.port.in.LinkUserToCustomerUseCase;
import ru.florify.customer.application.port.out.CustomerCachePort;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.model.Customer;

import java.time.Clock;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Transactional
public class LinkUserToCustomerInteractor implements LinkUserToCustomerUseCase {

    private final CustomerRepository customerRepository;
    private final CustomerCachePort cachePort;
    private final Clock clock;

    @Override
    public void execute(LinkUserToCustomerCommand command) {
        Customer customer = customerRepository.findById(command.customerId())
            .orElseThrow(() -> new CustomerNotFoundException(command.customerId()));

        Customer linked = customer.linkUser(command.userId(), Instant.now(clock));
        customerRepository.save(linked);
        
        // Evict from cache to stay consistent
        cachePort.evict(command.customerId());
    }
}
