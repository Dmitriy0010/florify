package ru.florify.analytics.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.application.port.in.GetEmployeePerformanceUseCase;
import ru.florify.analytics.application.port.out.OrderFactRepository;
import ru.florify.analytics.application.result.EmployeePerformanceResult;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class GetEmployeePerformanceInteractor implements GetEmployeePerformanceUseCase {
    private final OrderFactRepository repository;

    @Override
    @Transactional(readOnly = true)
    public EmployeePerformanceResult getEmployeePerformance(LocalDate from, LocalDate to) {
        return repository.aggregateEmployeePerformance(from, to);
    }
}
