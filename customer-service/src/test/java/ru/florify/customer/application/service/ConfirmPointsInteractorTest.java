package ru.florify.customer.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import ru.florify.common.event.PointsConfirmedEvent;
import ru.florify.common.event.TierUpgradedEvent;
import ru.florify.customer.application.command.ConfirmPointsCommand;
import ru.florify.customer.application.port.out.*;
import ru.florify.customer.domain.enums.LoyaltyTier;
import ru.florify.customer.domain.model.LoyaltyAccount;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConfirmPointsInteractorTest {

    @Mock
    private LoyaltyAccountRepository loyaltyAccountRepository;
    @Mock
    private LoyaltyTransactionRepository transactionRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    private final Clock clock = Clock.fixed(Instant.parse("2026-04-13T10:00:00Z"), ZoneId.of("UTC"));
    private ConfirmPointsInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new ConfirmPointsInteractor(
            loyaltyAccountRepository, transactionRepository, eventPublisher, clock);
    }

    @Test
    @DisplayName("Should successfully confirm points, earn new ones, and check for tier upgrade")
    void shouldConfirmPointsSuccessfully() {
        // given
        UUID customerId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        ConfirmPointsCommand command = new ConfirmPointsCommand(
            customerId, orderId, 30, new BigDecimal("500.00"), UUID.randomUUID());

        LoyaltyAccount account = mock(LoyaltyAccount.class);
        when(loyaltyAccountRepository.findByCustomerId(customerId)).thenReturn(Optional.of(account));
        when(account.getTier()).thenReturn(LoyaltyTier.BRONZE);

        // Mock confirmation logic (simplified)
        when(account.confirm(anyInt(), anyInt(), any(), any())).thenReturn(account);
        when(account.upgradeTierIfNeeded(any())).thenReturn(account); // No upgrade in this mock

        // when
        interactor.execute(command);

        // then
        // Verify points earned calculation: (500 / 100) * 1 = 5
        verify(account).confirm(eq(30), eq(5), eq(new BigDecimal("500.00")), any());
        
        verify(loyaltyAccountRepository).save(any(LoyaltyAccount.class));
        verify(transactionRepository, times(2)).save(any()); // Deduction + Earning
        verify(eventPublisher).publishEvent(any(PointsConfirmedEvent.class));
    }

    @Test
    @DisplayName("Should publish TierUpgradedEvent when tier changes")
    void shouldPublishTierUpgradeEvent() {
        // given
        UUID customerId = UUID.randomUUID();
        ConfirmPointsCommand command = new ConfirmPointsCommand(
            customerId, UUID.randomUUID(), 0, new BigDecimal("5000.00"), UUID.randomUUID());

        LoyaltyAccount account = mock(LoyaltyAccount.class);
        when(loyaltyAccountRepository.findByCustomerId(customerId)).thenReturn(Optional.of(account));
        when(account.getTier()).thenReturn(LoyaltyTier.BRONZE);

        LoyaltyAccount upgradedAccount = mock(LoyaltyAccount.class);
        when(upgradedAccount.getTier()).thenReturn(LoyaltyTier.SILVER); // Tier changed
        when(upgradedAccount.getPointsBalance()).thenReturn(50);
        
        when(account.confirm(anyInt(), anyInt(), any(), any())).thenReturn(account);
        when(account.upgradeTierIfNeeded(any())).thenReturn(upgradedAccount);

        // when
        interactor.execute(command);

        // then
        verify(eventPublisher).publishEvent(any(PointsConfirmedEvent.class));
        verify(eventPublisher).publishEvent(any(TierUpgradedEvent.class));
    }
}
