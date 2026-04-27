package ru.florify.employee.application.port.out;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.UUID;

public interface EmployeeOrderSalesQuery {

    SalesTotals salesForEmployeeInPeriod(UUID employeeId, YearMonth period);

    record SalesTotals(BigDecimal totalSalesAmount, int ordersCount) {}
}
