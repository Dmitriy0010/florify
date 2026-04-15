package ru.florify.customer.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.customer.application.command.ReleasePointsCommand;
import ru.florify.customer.application.outbox.OutboxEvent;
import ru.florify.customer.application.port.out.IdempotencyPort;
import ru.florify.customer.application.port.out.LoyaltyAccountRepository;
import ru.florify.customer.application.port.out.LoyaltyTransactionRepository;
import ru.florify.customer.application.port.out.OutboxRepository;
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
    private OutboxRepository outboxRepository;
    @Mock
    private IdempotencyPort idempotencyPort;

    private final Clock clock = Clock.fixed(Instant.parse("2026-04-13T12:00:00Z"), ZoneId.of("UTC"));
    private ReleasePointsInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new ReleasePointsInteractor(
            loyaltyAccountRepository, transactionRepository, outboxRepository, idempotencyPort, clock);
    }

    @Test
    @DisplayName("Should successfully release points and save to outbox")
    void shouldReleasePointsSuccessfully() {
        // given
        UUID eventId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        ReleasePointsCommand command = new ReleasePointsCommand(customerId, orderId, 50, eventId);

        when(idempotencyPort.isProcessed(eventId, "release-points-consumer")).thenReturn(false);

        LoyaltyAccount account = mock(LoyaltyAccount.class);
        when(loyaltyAccountRepository.findByCustomerId(customerId)).thenReturn(Optional.of(account));
        when(account.release(eq(50), any())).thenReturn(account);

        // when
        interactor.execute(command);

        // then
        verify(loyaltyAccountRepository).save(any(LoyaltyAccount.class));
        verify(transactionRepository).save(any(LoyaltyTransaction.class));
        verify(outboxRepository).save(any(OutboxEvent.class));
        verify(idempotencyPort).saveProcessedEvent(eventId, "release-points-consumer");
    }

    @Test
    @DisplayName("Should skip processing if event is already processed")
    void shouldSkipIfAlreadyProcessed() {
        // given
        UUID eventId = UUID.randomUUID();
        ReleasePointsCommand command = new ReleasePointsCommand(UUID.randomUUID(), UUID.randomUUID(), 50, eventId);
        when(idempotencyPort.isProcessed(eventId, "release-points-consumer")).thenReturn(true);

        // when
        interactor.execute(command);

        // then
        verifyNoInteractions(loyaltyAccountRepository, transactionRepository, outboxRepository);
    }
}
