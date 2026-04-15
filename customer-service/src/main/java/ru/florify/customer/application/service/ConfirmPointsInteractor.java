package ru.florify.customer.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.command.ConfirmPointsCommand;
import ru.florify.customer.application.outbox.OutboxEvent;
import ru.florify.customer.application.port.in.ConfirmPointsUseCase;
import ru.florify.customer.application.port.out.*;
import ru.florify.customer.domain.enums.LoyaltyTier;
import ru.florify.customer.domain.enums.LoyaltyTxType;
import ru.florify.customer.domain.event.PointsConfirmedEvent;
import ru.florify.customer.domain.event.TierUpgradedEvent;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.model.LoyaltyAccount;
import ru.florify.customer.domain.model.LoyaltyTierConfig;
import ru.florify.customer.domain.model.LoyaltyTransaction;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConfirmPointsInteractor implements ConfirmPointsUseCase {

    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository transactionRepository;
    private final TierConfigRepository tierConfigRepository;
    private final OutboxRepository outboxRepository;
    private final IdempotencyPort idempotencyPort;
    private final Clock clock;

    private static final String CONSUMER_NAME = "confirm-points-consumer";

    @Override
    @Transactional
    @Retryable(retryFor = ObjectOptimisticLockingFailureException.class, 
               maxAttempts = 3, 
               backoff = @Backoff(delay = 100))
    public void execute(ConfirmPointsCommand command) {
        // 1. Idempotency check
        if (idempotencyPort.isProcessed(command.eventId(), CONSUMER_NAME)) {
            return;
        }

        // 2. Load account
        LoyaltyAccount account = loyaltyAccountRepository.findByCustomerId(command.customerId())
            .orElseThrow(() -> new CustomerNotFoundException(command.customerId()));

        // 3. Load configurations for calculation and upgrade
        List<LoyaltyTierConfig> configs = tierConfigRepository.findAll();
        LoyaltyTierConfig currentTierConfig = configs.stream()
            .filter(c -> c.getTier() == account.getTier())
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Config not found for tier: " + account.getTier()));

        // 4. Calculate earned points: (Amount / 100) * PointsPerHundred
        int pointsEarned = command.purchaseAmount()
            .divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN)
            .multiply(BigDecimal.valueOf(currentTierConfig.getPointsPerHundred()))
            .intValue();

        Instant now = Instant.now(clock);
        LoyaltyTier previousTier = account.getTier();

        // 5. Domain logic: confirm + check upgrade
        LoyaltyAccount updated = account
            .confirm(command.pointsToDeduct(), pointsEarned, command.purchaseAmount(), now)
            .upgradeTierIfNeeded(configs, now);

        loyaltyAccountRepository.save(updated);

        // 6. Record transactions (append-only)
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

        // 7. Outbox events
        outboxRepository.save(OutboxEvent.create(
            "customers.loyalty.points_confirmed",
            command.customerId().toString(),
            new PointsConfirmedEvent(
                UUID.randomUUID(), 
                command.customerId(), 
                command.orderId(), 
                command.pointsToDeduct(), 
                pointsEarned, 
                updated.getPointsBalance(), 
                now
            ),
            now, 
            currentTraceHeaders()
        ));

        if (updated.getTier() != previousTier) {
            outboxRepository.save(OutboxEvent.create(
                "customers.loyalty.tier_upgraded",
                command.customerId().toString(),
                new TierUpgradedEvent(
                    UUID.randomUUID(), 
                    command.customerId(), 
                    previousTier.name(), 
                    updated.getTier().name(), 
                    now
                ),
                now, 
                currentTraceHeaders()
            ));
        }

        // 8. Mark as processed
        idempotencyPort.saveProcessedEvent(command.eventId(), CONSUMER_NAME);
    }

    private Map<String, String> currentTraceHeaders() {
        return Collections.emptyMap();
    }
}
