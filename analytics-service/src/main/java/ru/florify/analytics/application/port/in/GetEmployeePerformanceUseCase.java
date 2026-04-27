package ru.florify.analytics.application.port.in;

import ru.florify.analytics.application.result.EmployeePerformanceResult;

import java.time.LocalDate;

public interface GetEmployeePerformanceUseCase {
    EmployeePerformanceResult getEmployeePerformance(LocalDate from, LocalDate to);
}
