package ru.florify.customer.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.command.ReleasePointsCommand;
import ru.florify.customer.application.port.in.ReleasePointsUseCase;
import ru.florify.customer.application.port.out.LoyaltyAccountRepository;
import ru.florify.customer.application.port.out.LoyaltyTransactionRepository;
import ru.florify.customer.domain.enums.LoyaltyTxType;
import ru.florify.common.event.PointsReleasedEvent;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.model.LoyaltyAccount;
import ru.florify.customer.domain.model.LoyaltyTransaction;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReleasePointsInteractor implements ReleasePointsUseCase {

    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository transactionRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    @Override
    @Transactional
    @Retryable(retryFor = ObjectOptimisticLockingFailureException.class,
               maxAttempts = 3,
               backoff = @Backoff(delay = 100))
    public void execute(ReleasePointsCommand command) {
        if (command.pointsToRelease() == 0) {
            return;
        }

        LoyaltyAccount account = loyaltyAccountRepository.findByCustomerId(command.customerId())
            .orElseThrow(() -> new CustomerNotFoundException(command.customerId()));

        Instant now = Instant.now(clock);

        LoyaltyAccount updated = account.release(command.pointsToRelease(), now);
        loyaltyAccountRepository.save(updated);

        transactionRepository.save(new LoyaltyTransaction(
            UUID.randomUUID(),
            account.getId(),
            command.orderId(),
            LoyaltyTxType.RELEASE,
            command.pointsToRelease(),
            "Released points for order " + command.orderId(),
            now
        ));

        // Internal event publishing (Modular Monolith)
        eventPublisher.publishEvent(new PointsReleasedEvent(
            command.customerId(),
            command.orderId(),
            command.pointsToRelease(),
            now
        ));
    }
}
