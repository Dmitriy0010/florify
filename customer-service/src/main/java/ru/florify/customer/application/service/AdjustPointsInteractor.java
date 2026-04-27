package ru.florify.customer.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.port.in.AdjustPointsUseCase;
import ru.florify.customer.application.port.out.LoyaltyAccountRepository;
import ru.florify.customer.application.port.out.LoyaltyTransactionRepository;
import ru.florify.customer.domain.enums.LoyaltyTxType;
import ru.florify.customer.domain.exception.CustomerNotFoundException;
import ru.florify.customer.domain.model.LoyaltyAccount;
import ru.florify.customer.domain.model.LoyaltyTransaction;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdjustPointsInteractor implements AdjustPointsUseCase {

    private final LoyaltyAccountRepository accountRepository;
    private final LoyaltyTransactionRepository transactionRepository;

    @Override
    @Transactional
    public void execute(AdjustPointsCommand command) {
        Instant now = Instant.now();
        LoyaltyAccount account = accountRepository.findByCustomerId(command.customerId())
                .orElseThrow(() -> new CustomerNotFoundException(command.customerId()));

        LoyaltyAccount updated;
        LoyaltyTxType type;
        int delta;

        if ("EARN".equalsIgnoreCase(command.type())) {
            updated = account.earnPoints(command.points(), now);
            type = LoyaltyTxType.EARN;
            delta = command.points();
        } else {
            updated = account.withdrawPoints(command.points(), now);
            type = LoyaltyTxType.WITHDRAW;
            delta = -command.points();
        }

        accountRepository.save(updated);

        LoyaltyTransaction transaction = new LoyaltyTransaction(
                UUID.randomUUID(),
                account.getId(),
                null, // orderId
                type,
                delta,
                command.description(),
                now
        );

        transactionRepository.save(transaction);
    }
}
