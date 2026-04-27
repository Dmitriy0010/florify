package ru.florify.customer.adapter.in.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import ru.florify.common.event.UserRegisteredEvent;
import ru.florify.customer.application.command.CreateCustomerCommand;
import ru.florify.customer.application.command.LinkUserToCustomerCommand;
import ru.florify.customer.application.port.in.CreateCustomerUseCase;
import ru.florify.customer.application.port.in.LinkUserToCustomerUseCase;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.domain.enums.CustomerSource;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomerUserRegisteredConsumer {

    private final CreateCustomerUseCase createCustomerUseCase;
    private final LinkUserToCustomerUseCase linkUserToCustomerUseCase;
    private final CustomerRepository customerRepository;

    @KafkaListener(topics = "auth.user.registered", groupId = "customer-service")
    public void consume(UserRegisteredEvent event, Acknowledgment ack) {
        log.info("Consumed UserRegisteredEvent for userId: {}", event.userId());

        try {
            // Only create profiles for CUSTOMERS
            if (!"CUSTOMER".equalsIgnoreCase(event.role())) {
                log.debug("Skipping UserRegisteredEvent for non-CUSTOMER role: {}", event.role());
                ack.acknowledge();
                return;
            }

            // check if customer already exists by phone
            customerRepository.findByPhone(event.phone()).ifPresentOrElse(
                existing -> {
                    // If exists, just link to UserId (idempotent)
                    log.info("Customer with phone {} already exists. Linking to userId {}", event.phone(), event.userId());
                    linkUserToCustomerUseCase.execute(new LinkUserToCustomerCommand(existing.getId(), event.userId()));
                },
                () -> {
                    // If not exists, create new profile
                    log.info("Creating new customer profile for userId {}", event.userId());
                    createCustomerUseCase.execute(new CreateCustomerCommand(
                        event.phone(),
                        event.email(),
                        "New",      // placeholder, usually collected during registration or updated later
                        "Customer", // placeholder
                        null,       // birthDate
                        null,       // gender
                        CustomerSource.WEB,
                        event.userId()
                    ));
                }
            );

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process UserRegisteredEvent for userId: {}", event.userId(), e);
            // ErrorHandler will handle retries and DLQ
        }
    }
}
