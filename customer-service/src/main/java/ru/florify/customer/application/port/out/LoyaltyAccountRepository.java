package ru.florify.customer.application.port.out;

import ru.florify.customer.domain.model.LoyaltyAccount;
import java.util.Optional;
import java.util.UUID;

public interface LoyaltyAccountRepository {
    LoyaltyAccount save(LoyaltyAccount account);
    Optional<LoyaltyAccount> findByCustomerId(UUID customerId);
}
