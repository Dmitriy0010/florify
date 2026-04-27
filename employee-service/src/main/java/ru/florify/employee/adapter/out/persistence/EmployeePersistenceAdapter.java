package ru.florify.employee.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import ru.florify.common.application.query.PagedResult;
import ru.florify.employee.adapter.out.persistence.mapper.EmployeePersistenceMapper;
import ru.florify.employee.adapter.out.persistence.repository.EmployeeJpaRepository;
import ru.florify.employee.application.port.out.EmployeeRepository;
import ru.florify.employee.domain.model.Employee;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EmployeePersistenceAdapter implements EmployeeRepository {

    private final EmployeeJpaRepository jpaRepository;
    private final EmployeePersistenceMapper mapper;

    @Override
    public Employee save(Employee employee) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(employee)));
    }

    @Override
    public Optional<Employee> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public boolean existsByUserId(UUID userId) {
        return jpaRepository.existsByUserId(userId);
    }

    @Override
    public PagedResult<Employee> findAll(String search, Boolean active, int page, int size) {
        var paged = jpaRepository.findAllWithFilters(search, active, PageRequest.of(page, size));
        return new PagedResult<>(paged.getContent().stream().map(mapper::toDomain).toList(), page, size, paged.getTotalElements());
    }
}
