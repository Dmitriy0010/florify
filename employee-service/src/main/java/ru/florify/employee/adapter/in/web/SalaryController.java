package ru.florify.employee.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.florify.common.application.query.PagedResult;
import ru.florify.common.security.UserPrincipal;
import ru.florify.employee.adapter.in.web.dto.CalculateSalaryRequest;
import ru.florify.employee.adapter.in.web.dto.SalaryConfigResponse;
import ru.florify.employee.adapter.in.web.dto.SalaryStatementResponse;
import ru.florify.employee.adapter.in.web.dto.UpsertSalaryConfigRequest;
import ru.florify.employee.adapter.in.web.mapper.SalaryWebMapper;
import ru.florify.employee.application.command.ApproveSalaryCommand;
import ru.florify.employee.application.command.CalculateSalaryCommand;
import ru.florify.employee.application.command.MarkSalaryPaidCommand;
import ru.florify.employee.application.port.in.SalaryConfigUseCase;
import ru.florify.employee.application.port.in.SalaryStatementUseCase;
import ru.florify.employee.domain.model.SalaryStatement;

import java.time.YearMonth;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryConfigUseCase salaryConfigUseCase;
    private final SalaryStatementUseCase salaryStatementUseCase;
    private final SalaryWebMapper mapper;

    @GetMapping("/api/v1/employees/{id}/salary-config")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','MANAGER')")
    public ResponseEntity<SalaryConfigResponse> getSalaryConfig(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toResponse(salaryConfigUseCase.getByEmployeeId(id)));
    }

    @PutMapping("/api/v1/employees/{id}/salary-config")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<SalaryConfigResponse> upsertSalaryConfig(
            @PathVariable UUID id,
            @Valid @RequestBody UpsertSalaryConfigRequest request) {
        return ResponseEntity.ok(mapper.toResponse(salaryConfigUseCase.upsert(mapper.toCommand(id, request))));
    }

    @GetMapping("/api/v1/salary/statements")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','MANAGER')")
    public ResponseEntity<PagedResult<SalaryStatementResponse>> listStatements(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String period,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        YearMonth parsedPeriod = period != null ? YearMonth.parse(period) : null;
        PagedResult<SalaryStatement> result = salaryStatementUseCase.list(employeeId, parsedPeriod, page, size);
        return ResponseEntity.ok(new PagedResult<>(
                result.data().stream().map(mapper::toResponse).toList(),
                result.page(), result.size(), result.totalElements()));
    }

    @PostMapping("/api/v1/salary/statements/calculate")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<SalaryStatementResponse> calculate(@Valid @RequestBody CalculateSalaryRequest request) {
        SalaryStatement statement = salaryStatementUseCase.calculate(
                new CalculateSalaryCommand(request.employeeId(), YearMonth.parse(request.period())));
        return ResponseEntity.status(201).body(mapper.toResponse(statement));
    }

    @PutMapping("/api/v1/salary/statements/{id}/approve")
    @PreAuthorize("hasAnyRole('OWNER')")
    public ResponseEntity<SalaryStatementResponse> approve(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(mapper.toResponse(
                salaryStatementUseCase.approve(new ApproveSalaryCommand(id, principal.getUserId()))));
    }

    @PutMapping("/api/v1/salary/statements/{id}/paid")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<SalaryStatementResponse> markPaid(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toResponse(salaryStatementUseCase.markPaid(new MarkSalaryPaidCommand(id))));
    }

    @PutMapping("/api/v1/salary/statements/{id}/adjust")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<SalaryStatementResponse> adjust(
            @PathVariable UUID id,
            @RequestBody java.util.Map<String, java.math.BigDecimal> adjustment) {
        return ResponseEntity.ok(mapper.toResponse(salaryStatementUseCase.adjust(
                new ru.florify.employee.application.command.AdjustSalaryCommand(id, 
                        adjustment.getOrDefault("manualBonus", java.math.BigDecimal.ZERO), 
                        adjustment.getOrDefault("deductions", java.math.BigDecimal.ZERO)))));
    }
}
