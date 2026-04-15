package ru.florify.customer.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.customer.application.command.AddCustomerEventCommand;
import ru.florify.customer.application.port.out.CustomerEventRepository;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.domain.enums.EventType;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.model.Customer;
import ru.florify.customer.domain.model.CustomerEvent;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AddCustomerEventInteractorTest {

    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private CustomerEventRepository eventRepository;

    private final Clock clock = Clock.systemUTC();
    private AddCustomerEventInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new AddCustomerEventInteractor(customerRepository, eventRepository, clock);
    }

    @Test
    @DisplayName("Should successfully save customer event")
    void shouldSaveEventSuccessfully() {
        // given
        UUID customerId = UUID.randomUUID();
        UUID performerId = UUID.randomUUID();
        AddCustomerEventCommand command = new AddCustomerEventCommand(
            customerId, performerId, EventType.NOTE, "Some note"
        );

        when(customerRepository.findById(customerId)).thenReturn(Optional.of(mock(Customer.class)));

        // when
        interactor.execute(command);

        // then
        verify(eventRepository).save(any(CustomerEvent.class));
    }

    @Test
    @DisplayName("Should throw CustomerNotFoundException when customer missing")
    void shouldThrowIfNotFound() {
        // given
        UUID customerId = UUID.randomUUID();
        AddCustomerEventCommand command = new AddCustomerEventCommand(
            customerId, UUID.randomUUID(), EventType.NOTE, "Some note"
        );
        when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> interactor.execute(command))
            .isInstanceOf(CustomerNotFoundException.class);

        verify(eventRepository, never()).save(any());
    }
}
