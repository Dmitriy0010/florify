package ru.florify.customer.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.customer.application.command.LinkUserToCustomerCommand;
import ru.florify.customer.application.port.out.CustomerCachePort;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.model.Customer;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LinkUserToCustomerInteractorTest {

    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private CustomerCachePort cachePort;

    private final Clock clock = Clock.fixed(Instant.parse("2026-04-13T12:00:00Z"), ZoneId.of("UTC"));
    private LinkUserToCustomerInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new LinkUserToCustomerInteractor(customerRepository, cachePort, clock);
    }

    @Test
    @DisplayName("Should successfully link user and evict cache")
    void shouldLinkUserSuccessfully() {
        // given
        UUID customerId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        LinkUserToCustomerCommand command = new LinkUserToCustomerCommand(customerId, userId);

        Customer customer = mock(Customer.class);
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(customer.linkUser(any(), any())).thenReturn(customer);

        // when
        interactor.execute(command);

        // then
        verify(customerRepository).save(any(Customer.class));
        verify(cachePort).evict(customerId);
    }

    @Test
    @DisplayName("Should throw CustomerNotFoundException when customer missing")
    void shouldThrowIfNotFound() {
        // given
        UUID customerId = UUID.randomUUID();
        LinkUserToCustomerCommand command = new LinkUserToCustomerCommand(customerId, UUID.randomUUID());
        when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> interactor.execute(command))
            .isInstanceOf(CustomerNotFoundException.class);

        verify(customerRepository, never()).save(any());
        verify(cachePort, never()).evict(any());
    }
}
