package ru.florify.analytics.application.port.out;

import ru.florify.analytics.domain.model.SalaryFact;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public interface SalaryFactRepository {
    void save(SalaryFact fact);
    boolean existsBySourceEventId(UUID sourceEventId);
    BigDecimal sumSalariesForPnl(LocalDate from, LocalDate to);
}
