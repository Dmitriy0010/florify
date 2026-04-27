package ru.florify.employee.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import ru.florify.employee.application.port.out.EmployeeOrderSalesQuery;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EmployeeOrderSalesJdbcAdapter implements EmployeeOrderSalesQuery {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public SalesTotals salesForEmployeeInPeriod(UUID employeeId, YearMonth period) {
        var start = period.atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        var end = period.plusMonths(1).atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        return jdbcTemplate.queryForObject(
                """
                SELECT COALESCE(SUM(total_amount), 0), COALESCE(COUNT(*)::bigint, 0)
                FROM analytics_order_facts
                WHERE assigned_employee_id = ?
                  AND status = 'COMPLETED'
                  AND completed_at >= ?
                  AND completed_at < ?
                """,
                (rs, rowNum) -> new SalesTotals(rs.getBigDecimal(1), rs.getInt(2)),
                employeeId,
                Timestamp.from(start),
                Timestamp.from(end)
        );
    }
}
