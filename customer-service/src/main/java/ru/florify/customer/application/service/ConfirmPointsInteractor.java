package ru.florify.customer.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.command.ConfirmPointsCommand;
import ru.florify.customer.application.port.in.ConfirmPointsUseCase;
import ru.florify.customer.application.port.out.*;
import ru.florify.common.event.PointsConfirmedEvent;
import ru.florify.common.event.TierUpgradedEvent;
import ru.florify.customer.domain.enums.LoyaltyTxType;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.enums.LoyaltyTier;
import ru.florify.customer.domain.model.LoyaltyAccount;
import ru.florify.customer.domain.model.LoyaltyTransaction;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConfirmPointsInteractor implements ConfirmPointsUseCase {

    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository transactionRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    @Override
    @Transactional
    @Retryable(retryFor = ObjectOptimisticLockingFailureException.class, 
               maxAttempts = 3, 
               backoff = @Backoff(delay = 100))
    public void execute(ConfirmPointsCommand command) {
        // 1. Load account
        LoyaltyAccount account = loyaltyAccountRepository.findByCustomerId(command.customerId())
            .orElseThrow(() -> new CustomerNotFoundException(command.customerId()));

        // 2. Calculate earned points from current tier
        int pointsEarned = command.purchaseAmount()
            .divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN)
            .multiply(BigDecimal.valueOf(account.getTier().getPointsPerHundred()))
            .intValue();

        Instant now = Instant.now(clock);
        LoyaltyTier previousTier = account.getTier();

        // 3. Domain logic: confirm + check upgrade
        LoyaltyAccount updated = account
            .confirm(command.pointsToDeduct(), pointsEarned, command.purchaseAmount(), now)
            .upgradeTierIfNeeded(now);

        loyaltyAccountRepository.save(updated);

        // 5. Record transactions (append-only)
        if (command.pointsToDeduct() > 0) {
            transactionRepository.save(new LoyaltyTransaction(
                UUID.randomUUID(), account.getId(), command.orderId(),
                LoyaltyTxType.CONFIRM, command.pointsToDeduct(),
                "Confirm deduction for order " + command.orderId(), now
            ));
        }
        
        transactionRepository.save(new LoyaltyTransaction(
            UUID.randomUUID(), account.getId(), command.orderId(),
            LoyaltyTxType.EARN, pointsEarned,
            "Earned for order " + command.orderId(), now
        ));

        // 6. Internal event publishing (Modular Monolith)
        eventPublisher.publishEvent(new PointsConfirmedEvent(
            command.customerId(), 
            command.orderId(), 
            command.pointsToDeduct(), 
            pointsEarned, 
            updated.getPointsBalance(), 
            now
        ));

        if (updated.getTier() != previousTier) {
            eventPublisher.publishEvent(new TierUpgradedEvent(
                command.customerId(), 
                previousTier.name(), 
                updated.getTier().name(), 
                now
            ));
        }
    }
}
