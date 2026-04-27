package ru.florify.finance.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.florify.finance.domain.model.FinancialType;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public interface FinancialTransactionJpaRepository extends JpaRepository<FinancialTransactionJpaEntity, UUID> {
    boolean existsByReferenceIdAndType(UUID referenceId, FinancialType type);

    @Query("SELECT t.type as type, SUM(t.amount) as total FROM FinancialTransactionJpaEntity t " +
           "WHERE t.occurredAt >= :from AND t.occurredAt <= :to " +
           "GROUP BY t.type")
    List<Object[]> aggregateByType(@Param("from") Instant from, @Param("to") Instant to);

    default Map<FinancialType, java.math.BigDecimal> getSummary(Instant from, Instant to) {
        return aggregateByType(from, to).stream()
                .collect(Collectors.toMap(
                        row -> (FinancialType) row[0],
                        row -> (java.math.BigDecimal) row[1]
                ));
    }
}
