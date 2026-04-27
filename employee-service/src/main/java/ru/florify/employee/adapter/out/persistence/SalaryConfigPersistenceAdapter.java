package ru.florify.employee.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.employee.adapter.out.persistence.mapper.SalaryConfigPersistenceMapper;
import ru.florify.employee.adapter.out.persistence.repository.SalaryConfigJpaRepository;
import ru.florify.employee.application.port.out.SalaryConfigRepository;
import ru.florify.employee.domain.model.SalaryConfig;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SalaryConfigPersistenceAdapter implements SalaryConfigRepository {

    private final SalaryConfigJpaRepository jpaRepository;
    private final SalaryConfigPersistenceMapper mapper;

    @Override
    public SalaryConfig save(SalaryConfig config) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(config)));
    }

    @Override
    public Optional<SalaryConfig> findCurrentByEmployeeId(UUID employeeId) {
        return jpaRepository.findTopByEmployeeIdOrderByValidFromDesc(employeeId).map(mapper::toDomain);
    }
}
