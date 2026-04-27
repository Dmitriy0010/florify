package ru.florify.customer.application.port.out;

import ru.florify.customer.domain.model.LoyaltyTransaction;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LoyaltyTransactionRepository {
    LoyaltyTransaction save(LoyaltyTransaction tx);
    List<LoyaltyTransaction> findByLoyaltyAccountId(UUID accountId);
    // Finds active reserve transaction by orderId for logic verification and release
    Optional<LoyaltyTransaction> findActiveReserveByOrderId(UUID orderId);
}
