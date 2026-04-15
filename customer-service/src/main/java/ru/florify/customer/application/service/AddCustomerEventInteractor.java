package ru.florify.customer.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.command.AddCustomerEventCommand;
import ru.florify.customer.application.port.in.AddCustomerEventUseCase;
import ru.florify.customer.application.port.out.CustomerEventRepository;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.model.CustomerEvent;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AddCustomerEventInteractor implements AddCustomerEventUseCase {

    private final CustomerRepository customerRepository;
    private final CustomerEventRepository eventRepository;
    private final Clock clock;

    @Override
    public void execute(AddCustomerEventCommand command) {
        // Verify customer exists
        if (!customerRepository.findById(command.customerId()).isPresent()) {
            throw new CustomerNotFoundException(command.customerId());
        }

        CustomerEvent event = new CustomerEvent(
            UUID.randomUUID(), 
            command.customerId(), 
            command.performerId(), 
            command.type(), 
            command.content(), 
            Instant.now(clock)
        );

        eventRepository.save(event);
    }
}
