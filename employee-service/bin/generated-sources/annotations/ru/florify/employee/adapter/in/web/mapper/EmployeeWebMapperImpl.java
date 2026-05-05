package ru.florify.employee.adapter.in.web.mapper;

import java.time.LocalDate;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.employee.adapter.in.web.dto.CreateEmployeeRequest;
import ru.florify.employee.adapter.in.web.dto.EmployeeResponse;
import ru.florify.employee.adapter.in.web.dto.UpdateEmployeeRequest;
import ru.florify.employee.application.command.CreateEmployeeCommand;
import ru.florify.employee.application.command.UpdateEmployeeCommand;
import ru.florify.employee.domain.model.Employee;
import ru.florify.employee.domain.model.EmployeeRole;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:40+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class EmployeeWebMapperImpl implements EmployeeWebMapper {

    @Override
    public CreateEmployeeCommand toCommand(CreateEmployeeRequest request) {
        if ( request == null ) {
            return null;
        }

        UUID userId = null;
        UUID storeId = null;
        String firstName = null;
        String lastName = null;
        String phone = null;
        EmployeeRole role = null;
        LocalDate hireDate = null;
        String avatarUrl = null;

        userId = request.userId();
        storeId = request.storeId();
        firstName = request.firstName();
        lastName = request.lastName();
        phone = request.phone();
        role = request.role();
        hireDate = request.hireDate();
        avatarUrl = request.avatarUrl();

        CreateEmployeeCommand createEmployeeCommand = new CreateEmployeeCommand( userId, storeId, firstName, lastName, phone, role, hireDate, avatarUrl );

        return createEmployeeCommand;
    }

    @Override
    public UpdateEmployeeCommand toCommand(UUID employeeId, UpdateEmployeeRequest request) {
        if ( employeeId == null && request == null ) {
            return null;
        }

        UUID storeId = null;
        String firstName = null;
        String lastName = null;
        String phone = null;
        EmployeeRole role = null;
        LocalDate dismissDate = null;
        boolean active = false;
        String avatarUrl = null;
        if ( request != null ) {
            storeId = request.storeId();
            firstName = request.firstName();
            lastName = request.lastName();
            phone = request.phone();
            role = request.role();
            dismissDate = request.dismissDate();
            active = request.active();
            avatarUrl = request.avatarUrl();
        }
        UUID employeeId1 = null;
        employeeId1 = employeeId;

        UpdateEmployeeCommand updateEmployeeCommand = new UpdateEmployeeCommand( employeeId1, storeId, firstName, lastName, phone, role, dismissDate, active, avatarUrl );

        return updateEmployeeCommand;
    }

    @Override
    public EmployeeResponse toResponse(Employee employee) {
        if ( employee == null ) {
            return null;
        }

        UUID id = null;
        UUID userId = null;
        UUID storeId = null;
        String firstName = null;
        String lastName = null;
        String phone = null;
        EmployeeRole role = null;
        LocalDate hireDate = null;
        LocalDate dismissDate = null;
        boolean active = false;
        String avatarUrl = null;

        id = employee.getId();
        userId = employee.getUserId();
        storeId = employee.getStoreId();
        firstName = employee.getFirstName();
        lastName = employee.getLastName();
        phone = employee.getPhone();
        role = employee.getRole();
        hireDate = employee.getHireDate();
        dismissDate = employee.getDismissDate();
        active = employee.isActive();
        avatarUrl = employee.getAvatarUrl();

        EmployeeResponse employeeResponse = new EmployeeResponse( id, userId, storeId, firstName, lastName, phone, role, hireDate, dismissDate, active, avatarUrl );

        return employeeResponse;
    }
}
