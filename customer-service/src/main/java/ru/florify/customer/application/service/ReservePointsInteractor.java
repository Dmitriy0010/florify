package ru.florify.customer.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.command.ReservePointsCommand;
import ru.florify.customer.application.outbox.OutboxEvent;
import ru.florify.customer.application.port.in.ReservePointsUseCase;
import ru.florify.customer.application.port.out.IdempotencyPort;
import ru.florify.customer.application.port.out.LoyaltyAccountRepository;
import ru.florify.customer.application.port.out.LoyaltyTransactionRepository;
import ru.florify.customer.application.port.out.OutboxRepository;
import ru.florify.customer.domain.enums.LoyaltyTxType;
import ru.florify.customer.domain.event.PointsReservedEvent;
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
public class ReservePointsInteractor implements ReservePointsUseCase {

    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository transactionRepository;
    private final OutboxRepository outboxRepository;
    private final IdempotencyPort idempotencyPort;
    private final Clock clock;

    private static final String CONSUMER_NAME = "reserve-points-consumer";

    @Override
    @Transactional
    @Retryable(retryFor = ObjectOptimisticLockingFailureException.class, 
               maxAttempts = 3, 
               backoff = @Backoff(delay = 100))
    public void execute(ReservePointsCommand command) {
        // 1. Idempotency check
        if (idempotencyPort.isProcessed(command.eventId(), CONSUMER_NAME)) {
            return;
        }

        if (command.pointsToReserve() == 0) {
            idempotencyPort.saveProcessedEvent(command.eventId(), CONSUMER_NAME);
            return;
        }

        // 2. Load account
        LoyaltyAccount account = loyaltyAccountRepository.findByCustomerId(command.customerId())
            .orElseThrow(() -> new CustomerNotFoundException(command.customerId()));

        Instant now = Instant.now(clock);

        // 3. Domain logic: reserve
        LoyaltyAccount updated = account.reserve(command.pointsToReserve(), now);
        loyaltyAccountRepository.save(updated);

        // 4. Record transaction (append-only)
        transactionRepository.save(new LoyaltyTransaction(
            UUID.randomUUID(), 
            account.getId(), 
            command.orderId(),
            LoyaltyTxType.RESERVE, 
            command.pointsToReserve(),
            "Reserved for order " + command.orderId(), 
            now
        ));

        // 5. Outbox event
        outboxRepository.save(OutboxEvent.create(
            "customers.loyalty.points_reserved",
            command.customerId().toString(),
            new PointsReservedEvent(
                UUID.randomUUID(), 
                command.customerId(), 
                command.orderId(), 
                command.pointsToReserve(), 
                updated.getReservedPoints(), 
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
