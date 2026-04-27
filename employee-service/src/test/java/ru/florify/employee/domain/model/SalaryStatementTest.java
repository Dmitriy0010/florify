package ru.florify.employee.domain.model;

import org.junit.jupiter.api.Test;
import ru.florify.employee.domain.exception.InvalidSalaryStateException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SalaryStatementTest {

    @Test
    void approveAndPayTransitionWorks() {
        SalaryStatement statement = SalaryStatement.builder()
                .id(UUID.randomUUID())
                .employeeId(UUID.randomUUID())
                .period(YearMonth.of(2026, 4))
                .baseSalary(BigDecimal.TEN)
                .salesBonus(BigDecimal.ONE)
                .orderBonus(BigDecimal.ONE)
                .manualBonus(BigDecimal.ZERO)
                .deductions(BigDecimal.ZERO)
                .totalPayout(BigDecimal.TEN)
                .status(PaymentStatus.DRAFT)
                .version(0)
                .build();

        SalaryStatement approved = statement.approve(UUID.randomUUID());
        SalaryStatement paid = approved.markPaid(Instant.parse("2026-04-01T00:00:00Z"));

        assertEquals(PaymentStatus.APPROVED, approved.getStatus());
        assertEquals(PaymentStatus.PAID, paid.getStatus());
    }

    @Test
    void cannotPayDraftStatement() {
        SalaryStatement statement = SalaryStatement.builder()
                .id(UUID.randomUUID())
                .employeeId(UUID.randomUUID())
                .period(YearMonth.of(2026, 4))
                .status(PaymentStatus.DRAFT)
                .build();

        assertThrows(InvalidSalaryStateException.class, () -> statement.markPaid(Instant.now()));
    }
}
