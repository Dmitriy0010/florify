package ru.florify.employee.adapter.out.persistence.mapper;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.employee.adapter.out.persistence.entity.EmployeeJpaEntity;
import ru.florify.employee.domain.model.Employee;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:40+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class EmployeePersistenceMapperImpl implements EmployeePersistenceMapper {

    @Override
    public EmployeeJpaEntity toEntity(Employee employee) {
        if ( employee == null ) {
            return null;
        }

        EmployeeJpaEntity.EmployeeJpaEntityBuilder employeeJpaEntity = EmployeeJpaEntity.builder();

        employeeJpaEntity.active( employee.isActive() );
        employeeJpaEntity.avatarUrl( employee.getAvatarUrl() );
        employeeJpaEntity.dismissDate( employee.getDismissDate() );
        employeeJpaEntity.firstName( employee.getFirstName() );
        employeeJpaEntity.hireDate( employee.getHireDate() );
        employeeJpaEntity.id( employee.getId() );
        employeeJpaEntity.lastName( employee.getLastName() );
        employeeJpaEntity.phone( employee.getPhone() );
        employeeJpaEntity.role( employee.getRole() );
        employeeJpaEntity.storeId( employee.getStoreId() );
        employeeJpaEntity.userId( employee.getUserId() );

        return employeeJpaEntity.build();
    }

    @Override
    public Employee toDomain(EmployeeJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        Employee.EmployeeBuilder employee = Employee.builder();

        employee.active( entity.isActive() );
        employee.avatarUrl( entity.getAvatarUrl() );
        employee.dismissDate( entity.getDismissDate() );
        employee.firstName( entity.getFirstName() );
        employee.hireDate( entity.getHireDate() );
        employee.id( entity.getId() );
        employee.lastName( entity.getLastName() );
        employee.phone( entity.getPhone() );
        employee.role( entity.getRole() );
        employee.storeId( entity.getStoreId() );
        employee.userId( entity.getUserId() );

        return employee.build();
    }
}
