package ru.florify.employee.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import ru.florify.common.application.query.PagedResult;
import ru.florify.employee.adapter.out.persistence.mapper.SalaryStatementPersistenceMapper;
import ru.florify.employee.adapter.out.persistence.repository.SalaryStatementJpaRepository;
import ru.florify.employee.application.port.out.SalaryStatementRepository;
import ru.florify.employee.domain.model.SalaryStatement;

import java.time.YearMonth;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SalaryStatementPersistenceAdapter implements SalaryStatementRepository {

    private final SalaryStatementJpaRepository jpaRepository;
    private final SalaryStatementPersistenceMapper mapper;

    @Override
    public SalaryStatement save(SalaryStatement statement) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(statement)));
    }

    @Override
    public Optional<SalaryStatement> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<SalaryStatement> findByEmployeeAndPeriod(UUID employeeId, YearMonth period) {
        return jpaRepository.findByEmployeeIdAndPeriod(employeeId, period.toString()).map(mapper::toDomain);
    }

    @Override
    public PagedResult<SalaryStatement> findAll(UUID employeeId, YearMonth period, int page, int size) {
        var paged = jpaRepository.findAllWithFilters(employeeId, period == null ? null : period.toString(), PageRequest.of(page, size));
        return new PagedResult<>(paged.getContent().stream().map(mapper::toDomain).toList(), page, size, paged.getTotalElements());
    }
}
