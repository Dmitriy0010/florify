package ru.florify.customer.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.customer.application.command.UpdateCustomerCommand;
import ru.florify.customer.application.port.out.CustomerCachePort;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.domain.enums.Gender;
import ru.florify.customer.domain.model.Customer;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UpdateCustomerInteractorTest {

    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private CustomerCachePort cachePort;

    private final Clock clock = Clock.fixed(Instant.parse("2026-04-13T10:00:00Z"), ZoneId.of("UTC"));
    private UpdateCustomerInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new UpdateCustomerInteractor(customerRepository, cachePort, clock);
    }

    @Test
    @DisplayName("Should successfully update customer fields and tags")
    void shouldUpdateCustomerSuccessfully() {
        // given
        UUID customerId = UUID.randomUUID();
        UpdateCustomerCommand command = new UpdateCustomerCommand(
            customerId, "new@florify.ru", "NewName", "NewSurname",
            null, Gender.FEMALE, List.of("vip", "new-tag"), null
        );

        Customer existing = Customer.builder()
            .id(customerId)
            .phone("+79001112233")
            .tags(List.of("old"))
            .build();
        
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(existing));
        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> i.getArguments()[0]);

        // when
        Customer result = interactor.execute(command);

        // then
        assertThat(result.getEmail()).isEqualTo("new@florify.ru");
        assertThat(result.getFirstName()).isEqualTo("NewName");
        assertThat(result.getTags()).containsExactly("vip", "new-tag");

        verify(customerRepository).save(any(Customer.class));
        verify(cachePort).evict(customerId);
    }
}
