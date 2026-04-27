package ru.florify.analytics.adapter.out.persistence.adapter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.analytics.adapter.out.persistence.entity.CostFactJpaEntity;
import ru.florify.analytics.adapter.out.persistence.entity.CostFactType;
import ru.florify.analytics.adapter.out.persistence.repository.CostFactJpaRepository;
import ru.florify.analytics.application.port.out.SalaryFactRepository;
import ru.florify.analytics.domain.model.SalaryFact;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SalaryFactPersistenceAdapter implements SalaryFactRepository {
    private final CostFactJpaRepository repository;

    @Override
    public void save(SalaryFact fact) {
        repository.save(CostFactJpaEntity.builder()
                .id(fact.getId())
                .costType(CostFactType.SALARY)
                .sourceRefId(fact.getSourceEventId())
                .storeId(fact.getStoreId())
                .occurredAt(fact.getPaidAt())
                .recordedAt(fact.getRecordedAt())
                .amount(fact.getAmount())
                .employeeId(fact.getEmployeeId())
                .employeeName(fact.getEmployeeName())
                .employeeRole(fact.getEmployeeRole())
                .periodStart(fact.getPeriodStart())
                .periodEnd(fact.getPeriodEnd())
                .build());
    }

    @Override
    public boolean existsBySourceEventId(UUID sourceEventId) {
        return repository.existsByCostTypeAndSourceRefId(CostFactType.SALARY, sourceEventId);
    }

    @Override
    public BigDecimal sumSalariesForPnl(LocalDate from, LocalDate to) {
        Instant fromInstant = from.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toInstant = to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC).minusSeconds(1);
        return repository.sumAmountBetweenByType(CostFactType.SALARY, fromInstant, toInstant);
    }
}
