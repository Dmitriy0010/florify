package ru.florify.customer.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.command.ReleasePointsCommand;
import ru.florify.customer.application.outbox.OutboxEvent;
import ru.florify.customer.application.port.in.ReleasePointsUseCase;
import ru.florify.customer.application.port.out.IdempotencyPort;
import ru.florify.customer.application.port.out.LoyaltyAccountRepository;
import ru.florify.customer.application.port.out.LoyaltyTransactionRepository;
import ru.florify.customer.application.port.out.OutboxRepository;
import ru.florify.customer.domain.enums.LoyaltyTxType;
import ru.florify.customer.domain.event.PointsReleasedEvent;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.model.LoyaltyAccount;
import ru.florify.customer.domain.model.LoyaltyTransaction;

import java.time.Clock;
import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReleasePointsInteractor implements ReleasePointsUseCase {

    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository transactionRepository;
    private final OutboxRepository outboxRepository;
    private final IdempotencyPort idempotencyPort;
    private final Clock clock;

    private static final String CONSUMER_NAME = "release-points-consumer";

    @Override
    @Transactional
    @Retryable(retryFor = ObjectOptimisticLockingFailureException.class, 
               maxAttempts = 3, 
               backoff = @Backoff(delay = 100))
    public void execute(ReleasePointsCommand command) {
        // 1. Idempotency check
        if (idempotencyPort.isProcessed(command.eventId(), CONSUMER_NAME)) {
            return;
        }

        if (command.pointsToRelease() == 0) {
            idempotencyPort.saveProcessedEvent(command.eventId(), CONSUMER_NAME);
            return;
        }

        // 2. Load account
        LoyaltyAccount account = loyaltyAccountRepository.findByCustomerId(command.customerId())
            .orElseThrow(() -> new CustomerNotFoundException(command.customerId()));

        Instant now = Instant.now(clock);

        // 3. Domain logic: release reserve
        LoyaltyAccount updated = account.release(command.pointsToRelease(), now);
        loyaltyAccountRepository.save(updated);

        // 4. Record transaction (append-only)
        transactionRepository.save(new LoyaltyTransaction(
            UUID.randomUUID(), 
            account.getId(), 
            command.orderId(),
            LoyaltyTxType.RELEASE, 
            command.pointsToRelease(),
            "Released points for order " + command.orderId(), 
            now
        ));

        // 5. Outbox event
        outboxRepository.save(OutboxEvent.create(
            "customers.loyalty.points_released",
            command.customerId().toString(),
            new PointsReleasedEvent(
                UUID.randomUUID(), 
                command.customerId(), 
                command.orderId(), 
                command.pointsToRelease(), 
                now
            ),
            now, 
            currentTraceHeaders()
        ));

        // 6. Mark as processed
        idempotencyPort.saveProcessedEvent(command.eventId(), CONSUMER_NAME);
    }

    private Map<String, String> currentTraceHeaders() {
        return Collections.emptyMap();
    }
}
