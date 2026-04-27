package ru.florify.customer.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.command.CreateCustomerCommand;
import ru.florify.customer.application.port.in.CreateCustomerUseCase;
import org.springframework.context.ApplicationEventPublisher;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.application.port.out.LoyaltyAccountRepository;
import ru.florify.customer.domain.enums.Gender;
import ru.florify.customer.domain.enums.LoyaltyTier;
import ru.florify.customer.domain.event.CustomerCreatedEvent;
import ru.florify.customer.domain.exception.DuplicateCustomerException;
import ru.florify.customer.domain.model.Customer;
import ru.florify.customer.domain.model.LoyaltyAccount;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateCustomerInteractor implements CreateCustomerUseCase {

    private final CustomerRepository customerRepository;
    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    @Override
    public Customer execute(CreateCustomerCommand command) {
        // Pre-check for duplicates before transaction to avoid Rollback-Only state
        customerRepository.findByPhone(command.phone()).ifPresent(existing -> {
            throw new DuplicateCustomerException(command.phone());
        });

        Instant now = Instant.now(clock);

        Customer customer = Customer.builder()
            .id(UUID.randomUUID())
            .phone(command.phone())
            .email(command.email())
            .firstName(command.firstName())
            .lastName(command.lastName())
            .birthDate(command.birthDate())
            .gender(command.gender() != null ? command.gender() : Gender.UNSPECIFIED)
            .source(command.source())
            .userId(command.userId())
            .tags(List.of())
            .active(true)
            .createdAt(now)
            .updatedAt(now)
            .build();

        Customer saved = customerRepository.save(customer);

        LoyaltyAccount account = LoyaltyAccount.builder()
            .id(UUID.randomUUID())
            .customerId(saved.getId())
            .tier(LoyaltyTier.BRONZE)
            .pointsBalance(0)
            .reservedPoints(0)
            .totalSpent(BigDecimal.ZERO)
            .createdAt(now)
            .updatedAt(now)
            .build();
        loyaltyAccountRepository.save(account);

        eventPublisher.publishEvent(CustomerCreatedEvent.from(saved, now));

        return saved;
    }

    /**
     * Helper for OTel trace propagation. 
     * Implement proper OTel injection if dependency is available.
     */
    private Map<String, String> currentTraceHeaders() {
        // Placeholder until OTel dependencies are confirmed in the project
        return Collections.emptyMap();
    }
}
