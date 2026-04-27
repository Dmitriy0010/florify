package ru.florify.employee.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ru.florify.employee.adapter.out.persistence.entity.EmployeeJpaEntity;
import ru.florify.employee.domain.model.Employee;

@Mapper(componentModel = "spring")
public interface EmployeePersistenceMapper {
    EmployeeJpaEntity toEntity(Employee employee);
    Employee toDomain(EmployeeJpaEntity entity);
}
