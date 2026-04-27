package ru.florify.employee.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.florify.common.application.query.PagedResult;
import ru.florify.employee.adapter.in.web.dto.CreateEmployeeRequest;
import ru.florify.employee.adapter.in.web.dto.EmployeeResponse;
import ru.florify.employee.adapter.in.web.dto.UpdateEmployeeRequest;
import ru.florify.employee.adapter.in.web.mapper.EmployeeWebMapper;
import ru.florify.employee.application.port.in.EmployeeUseCase;
import ru.florify.employee.domain.model.Employee;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeUseCase employeeUseCase;
    private final EmployeeWebMapper mapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','MANAGER')")
    public ResponseEntity<PagedResult<EmployeeResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResult<Employee> result = employeeUseCase.list(search, active, page, size);
        return ResponseEntity.ok(new PagedResult<>(
                result.data().stream().map(mapper::toResponse).toList(),
                result.page(),
                result.size(),
                result.totalElements()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody CreateEmployeeRequest request) {
        return ResponseEntity.status(201).body(mapper.toResponse(employeeUseCase.create(mapper.toCommand(request))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','MANAGER')")
    public ResponseEntity<EmployeeResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toResponse(employeeUseCase.getById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<EmployeeResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdateEmployeeRequest request) {
        return ResponseEntity.ok(mapper.toResponse(employeeUseCase.update(mapper.toCommand(id, request))));
    }
}
