package ru.florify.customer.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.customer.application.command.ConfirmPointsCommand;
import ru.florify.customer.application.outbox.OutboxEvent;
import ru.florify.customer.application.port.out.*;
import ru.florify.customer.domain.enums.LoyaltyTier;
import ru.florify.customer.domain.model.LoyaltyAccount;
import ru.florify.customer.domain.model.LoyaltyTierConfig;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConfirmPointsInteractorTest {

    @Mock
    private LoyaltyAccountRepository loyaltyAccountRepository;
    @Mock
    private LoyaltyTransactionRepository transactionRepository;
    @Mock
    private TierConfigRepository tierConfigRepository;
    @Mock
    private OutboxRepository outboxRepository;
    @Mock
    private IdempotencyPort idempotencyPort;

    private final Clock clock = Clock.fixed(Instant.parse("2026-04-13T10:00:00Z"), ZoneId.of("UTC"));
    private ConfirmPointsInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new ConfirmPointsInteractor(
            loyaltyAccountRepository, transactionRepository, tierConfigRepository, 
            outboxRepository, idempotencyPort, clock);
    }

    @Test
    @DisplayName("Should successfully confirm points, earn new ones, and check for tier upgrade")
    void shouldConfirmPointsSuccessfully() {
        // given
        UUID eventId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        ConfirmPointsCommand command = new ConfirmPointsCommand(
            customerId, orderId, 30, new BigDecimal("500.00"), UUID.randomUUID(), eventId);

        when(idempotencyPort.isProcessed(eventId, "confirm-points-consumer")).thenReturn(false);

        LoyaltyAccount account = mock(LoyaltyAccount.class);
        when(loyaltyAccountRepository.findByCustomerId(customerId)).thenReturn(Optional.of(account));
        when(account.getTier()).thenReturn(LoyaltyTier.BRONZE);

        List<LoyaltyTierConfig> configs = List.of(
            LoyaltyTierConfig.builder().tier(LoyaltyTier.BRONZE).tierRank(1).pointsPerHundred(5).minSpend(BigDecimal.ZERO).build(),
            LoyaltyTierConfig.builder().tier(LoyaltyTier.SILVER).tierRank(2).pointsPerHundred(10).minSpend(new BigDecimal("1000.00")).build()
        );
        when(tierConfigRepository.findAll()).thenReturn(configs);

        // Mock confirmation logic (simplified)
        when(account.confirm(anyInt(), anyInt(), any(), any())).thenReturn(account);
        when(account.upgradeTierIfNeeded(any(), any())).thenReturn(account); // No upgrade in this mock

        // when
        interactor.execute(command);

        // then
        // Verify points earned calculation: (500 / 100) * 5 = 25
        verify(account).confirm(eq(30), eq(25), eq(new BigDecimal("500.00")), any());
        
        verify(loyaltyAccountRepository).save(any(LoyaltyAccount.class));
        verify(transactionRepository, times(2)).save(any()); // Deduction + Earning
        verify(outboxRepository, atLeastOnce()).save(any(OutboxEvent.class));
        verify(idempotencyPort).saveProcessedEvent(eventId, "confirm-points-consumer");
    }

    @Test
    @DisplayName("Should publish TierUpgradedEvent when tier changes")
    void shouldPublishTierUpgradeEvent() {
        // given
        UUID customerId = UUID.randomUUID();
        ConfirmPointsCommand command = new ConfirmPointsCommand(
            customerId, UUID.randomUUID(), 0, new BigDecimal("5000.00"), UUID.randomUUID(), UUID.randomUUID());

        LoyaltyAccount account = mock(LoyaltyAccount.class);
        when(loyaltyAccountRepository.findByCustomerId(customerId)).thenReturn(Optional.of(account));
        when(account.getTier()).thenReturn(LoyaltyTier.BRONZE);

        List<LoyaltyTierConfig> configs = List.of(
            LoyaltyTierConfig.builder().tier(LoyaltyTier.BRONZE).tierRank(1).pointsPerHundred(5).minSpend(BigDecimal.ZERO).build()
        );
        when(tierConfigRepository.findAll()).thenReturn(configs);

        LoyaltyAccount upgradedAccount = mock(LoyaltyAccount.class);
        when(upgradedAccount.getTier()).thenReturn(LoyaltyTier.SILVER); // Tier changed
        
        when(account.confirm(anyInt(), anyInt(), any(), any())).thenReturn(account);
        when(account.upgradeTierIfNeeded(any(), any())).thenReturn(upgradedAccount);

        // when
        interactor.execute(command);

        // then
        ArgumentCaptor<OutboxEvent> outboxCaptor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxRepository, times(2)).save(outboxCaptor.capture()); // PointsConfirmed + TierUpgraded
        
        List<OutboxEvent> savedEvents = outboxCaptor.getAllValues();
        assertThat(savedEvents.stream().anyMatch(e -> e.getTopic().equals("customers.loyalty.tier_upgraded"))).isTrue();
    }
}
