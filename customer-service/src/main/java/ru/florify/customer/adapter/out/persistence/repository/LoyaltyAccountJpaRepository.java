package ru.florify.customer.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.florify.customer.adapter.out.persistence.entity.LoyaltyAccountJpaEntity;

import java.util.Optional;
import java.util.UUID;

public interface LoyaltyAccountJpaRepository extends JpaRepository<LoyaltyAccountJpaEntity, UUID> {
    Optional<LoyaltyAccountJpaEntity> findByCustomerId(UUID customerId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(a.pointsBalance) FROM LoyaltyAccountJpaEntity a")
    Long sumTotalActivePoints();
}
