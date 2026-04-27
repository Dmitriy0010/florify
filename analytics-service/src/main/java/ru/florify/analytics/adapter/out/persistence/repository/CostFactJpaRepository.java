package ru.florify.analytics.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ru.florify.analytics.adapter.out.persistence.entity.CostFactJpaEntity;
import ru.florify.analytics.adapter.out.persistence.entity.CostFactType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public interface CostFactJpaRepository extends JpaRepository<CostFactJpaEntity, UUID> {
    boolean existsByCostTypeAndSourceRefId(CostFactType costType, UUID sourceRefId);

    @Query("""
        select coalesce(sum(c.amount), 0)
        from CostFactJpaEntity c
        where c.costType = :costType and c.occurredAt >= :from and c.occurredAt <= :to
        """)
    BigDecimal sumAmountBetweenByType(CostFactType costType, Instant from, Instant to);

    @Query("""
        select coalesce(sum(c.quantity), 0)
        from CostFactJpaEntity c
        where c.costType = :costType and c.occurredAt >= :from
        """)
    BigDecimal sumQuantityAfterByType(CostFactType costType, Instant from);
}
