package ru.florify.customer.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.customer.application.command.CreateCustomerCommand;
import ru.florify.customer.application.outbox.OutboxEvent;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.application.port.out.LoyaltyAccountRepository;
import ru.florify.customer.application.port.out.OutboxRepository;
import ru.florify.customer.domain.enums.CustomerSource;
import ru.florify.customer.domain.enums.Gender;
import ru.florify.customer.domain.enums.LoyaltyTier;
import ru.florify.customer.domain.exception.DuplicateCustomerException;
import ru.florify.customer.domain.model.Customer;
import ru.florify.customer.domain.model.LoyaltyAccount;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreateCustomerInteractorTest {

    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private LoyaltyAccountRepository loyaltyAccountRepository;
    @Mock
    private OutboxRepository outboxRepository;

    private final Clock clock = Clock.fixed(Instant.parse("2026-04-13T10:00:00Z"), ZoneId.of("UTC"));

    private CreateCustomerInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new CreateCustomerInteractor(customerRepository, loyaltyAccountRepository, outboxRepository, clock);
    }

    @Test
    @DisplayName("Should successfully create customer and bronze loyalty account")
    void shouldCreateCustomerSuccessfully() {
        // given
        CreateCustomerCommand command = new CreateCustomerCommand(
            "+79001112233", "test@florify.ru", "Ivan", "Ivanov",
            LocalDate.of(1990, 1, 1), Gender.MALE, CustomerSource.WEB, null
        );

        when(customerRepository.findByPhone(command.phone())).thenReturn(Optional.empty());
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // when
        Customer result = interactor.execute(command);

        // then
        assertThat(result.getPhone()).isEqualTo(command.phone());
        assertThat(result.isActive()).isTrue();

        verify(customerRepository).save(any(Customer.class));
        
        // Verify loyalty account creation
        ArgumentCaptor<LoyaltyAccount> accountCaptor = ArgumentCaptor.forClass(LoyaltyAccount.class);
        verify(loyaltyAccountRepository).save(accountCaptor.capture());
        assertThat(accountCaptor.getValue().getTier()).isEqualTo(LoyaltyTier.BRONZE);
        assertThat(accountCaptor.getValue().getCustomerId()).isEqualTo(result.getId());

        // Verify outbox event
        verify(outboxRepository).save(any(OutboxEvent.class));
    }

    @Test
    @DisplayName("Should throw DuplicateCustomerException when phone already exists")
    void shouldThrowWhenDuplicatePhone() {
        // given
        CreateCustomerCommand command = new CreateCustomerCommand(
            "+79001112233", "test@florify.ru", "Ivan", "Ivanov", null, null, CustomerSource.WEB, null
        );

        when(customerRepository.findByPhone(command.phone())).thenReturn(Optional.of(mock(Customer.class)));

        // when & then
        assertThatThrownBy(() -> interactor.execute(command))
            .isInstanceOf(DuplicateCustomerException.class)
            .hasMessageContaining(command.phone());

        verify(customerRepository, never()).save(any());
    }
}
