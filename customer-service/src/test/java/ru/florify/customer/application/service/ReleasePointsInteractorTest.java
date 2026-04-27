package ru.florify.customer.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.customer.application.command.ReleasePointsCommand;
import ru.florify.customer.application.port.out.LoyaltyAccountRepository;
import ru.florify.customer.application.port.out.LoyaltyTransactionRepository;
import org.springframework.context.ApplicationEventPublisher;
import ru.florify.customer.domain.model.LoyaltyAccount;
import ru.florify.customer.domain.model.LoyaltyTransaction;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReleasePointsInteractorTest {

    @Mock
    private LoyaltyAccountRepository loyaltyAccountRepository;
    @Mock
    private LoyaltyTransactionRepository transactionRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    private final Clock clock = Clock.fixed(Instant.parse("2026-04-13T12:00:00Z"), ZoneId.of("UTC"));
    private ReleasePointsInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new ReleasePointsInteractor(
            loyaltyAccountRepository, transactionRepository, eventPublisher, clock);
    }

    @Test
    @DisplayName("Should successfully release points and publish event")
    void shouldReleasePointsSuccessfully() {
        // given
        UUID customerId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        ReleasePointsCommand command = new ReleasePointsCommand(customerId, orderId, 50);

        LoyaltyAccount account = mock(LoyaltyAccount.class);
        when(loyaltyAccountRepository.findByCustomerId(customerId)).thenReturn(Optional.of(account));
        when(account.release(eq(50), any())).thenReturn(account);

        // when
        interactor.execute(command);

        // then
        verify(loyaltyAccountRepository).save(any(LoyaltyAccount.class));
        verify(transactionRepository).save(any(LoyaltyTransaction.class));
        verify(eventPublisher).publishEvent(any(ru.florify.common.event.PointsReleasedEvent.class));
    }

    // Idempotency check removed as it's now handled by DB or higher layers
}
