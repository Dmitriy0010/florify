package ru.florify.customer.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.florify.customer.adapter.out.persistence.entity.LoyaltyTransactionJpaEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LoyaltyTransactionJpaRepository extends JpaRepository<LoyaltyTransactionJpaEntity, UUID> {
    List<LoyaltyTransactionJpaEntity> findByLoyaltyAccountIdOrderByOccurredAtDesc(UUID accountId);
    
    @org.springframework.data.jpa.repository.Query("SELECT t FROM LoyaltyTransactionJpaEntity t ORDER BY t.occurredAt DESC")
    List<LoyaltyTransactionJpaEntity> findAllGlobalRecent();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.points) FROM LoyaltyTransactionJpaEntity t WHERE t.type = 'EARN'")
    Long sumTotalEarnedPoints();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.points) FROM LoyaltyTransactionJpaEntity t WHERE t.type IN ('CONFIRM', 'WITHDRAW')")
    Long sumTotalSpentPoints();

    @org.springframework.data.jpa.repository.Query("SELECT t FROM LoyaltyTransactionJpaEntity t WHERE t.orderId = :orderId AND t.type = 'RESERVE'")
    Optional<LoyaltyTransactionJpaEntity> findActiveReserveByOrderId(@org.springframework.data.repository.query.Param("orderId") UUID orderId);
}
