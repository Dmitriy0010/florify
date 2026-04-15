package ru.florify.customer.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.customer.application.port.out.CustomerCachePort;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.model.Customer;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GetCustomerByIdInteractorTest {

    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private CustomerCachePort cachePort;

    private GetCustomerByIdInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new GetCustomerByIdInteractor(customerRepository, cachePort);
    }

    @Test
    @DisplayName("Should return customer from cache if present")
    void shouldReturnFromCache() {
        // given
        UUID customerId = UUID.randomUUID();
        Customer cached = mock(Customer.class);
        when(cachePort.get(customerId)).thenReturn(Optional.of(cached));

        // when
        Customer result = interactor.execute(customerId);

        // then
        assertThat(result).isEqualTo(cached);
        verifyNoInteractions(customerRepository);
    }

    @Test
    @DisplayName("Should fall back to repository and update cache on miss")
    void shouldReturnFromRepositoryOnCacheMiss() {
        // given
        UUID customerId = UUID.randomUUID();
        when(cachePort.get(customerId)).thenReturn(Optional.empty());
        
        Customer fromDb = mock(Customer.class);
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(fromDb));

        // when
        Customer result = interactor.execute(customerId);

        // then
        assertThat(result).isEqualTo(fromDb);
        verify(customerRepository).findById(customerId);
        verify(cachePort).put(customerId, fromDb);
    }

    @Test
    @DisplayName("Should throw CustomerNotFoundException when both miss")
    void shouldThrowIfNotFound() {
        // given
        UUID customerId = UUID.randomUUID();
        when(cachePort.get(customerId)).thenReturn(Optional.empty());
        when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> interactor.execute(customerId))
            .isInstanceOf(CustomerNotFoundException.class);
    }
}
