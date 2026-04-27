package ru.florify.analytics.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.application.command.RecordSalaryFactCommand;
import ru.florify.analytics.application.port.in.RecordSalaryFactUseCase;
import ru.florify.analytics.application.port.out.SalaryFactRepository;
import ru.florify.analytics.domain.model.SalaryFact;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecordSalaryFactInteractor implements RecordSalaryFactUseCase {
    private final SalaryFactRepository repository;

    @Override
    @Transactional
    public void record(RecordSalaryFactCommand cmd) {
        if (repository.existsBySourceEventId(cmd.sourceEventId())) {
            return;
        }
        SalaryFact fact = SalaryFact.builder()
                .id(UUID.randomUUID())
                .sourceEventId(cmd.sourceEventId())
                .employeeId(cmd.employeeId())
                .storeId(cmd.storeId())
                .employeeName(cmd.employeeName())
                .employeeRole(cmd.employeeRole())
                .amount(cmd.amount())
                .periodStart(cmd.periodStart())
                .periodEnd(cmd.periodEnd())
                .paidAt(cmd.paidAt())
                .recordedAt(Instant.now())
                .build();
        repository.save(fact);
    }
}
