package ru.florify.customer.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.command.ReservePointsCommand;
import ru.florify.customer.application.port.in.ReservePointsUseCase;
import ru.florify.customer.application.port.out.LoyaltyAccountRepository;
import ru.florify.customer.application.port.out.LoyaltyTransactionRepository;
import ru.florify.customer.domain.enums.LoyaltyTxType;
import ru.florify.common.event.PointsReservedEvent;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.model.LoyaltyAccount;
import ru.florify.customer.domain.model.LoyaltyTransaction;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservePointsInteractor implements ReservePointsUseCase {

    private final LoyaltyAccountRepository loyaltyAccountRepository;
    private final LoyaltyTransactionRepository transactionRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    @Override
    @Transactional
    @Retryable(retryFor = ObjectOptimisticLockingFailureException.class,
               maxAttempts = 3,
               backoff = @Backoff(delay = 100))
    public void execute(ReservePointsCommand command) {
        if (command.pointsToReserve() == 0) {
            return;
        }

        LoyaltyAccount account = loyaltyAccountRepository.findByCustomerId(command.customerId())
            .orElseThrow(() -> new CustomerNotFoundException(command.customerId()));

        Instant now = Instant.now(clock);

        LoyaltyAccount updated = account.reserve(command.pointsToReserve(), now);
        loyaltyAccountRepository.save(updated);

        transactionRepository.save(new LoyaltyTransaction(
            UUID.randomUUID(),
            account.getId(),
            command.orderId(),
            LoyaltyTxType.RESERVE,
            command.pointsToReserve(),
            "Reserved for order " + command.orderId(),
            now
        ));

        // Internal event publishing (Modular Monolith)
        eventPublisher.publishEvent(new PointsReservedEvent(
            command.customerId(),
            command.orderId(),
            command.pointsToReserve(),
            updated.getReservedPoints(),
            now
        ));
    }
}
