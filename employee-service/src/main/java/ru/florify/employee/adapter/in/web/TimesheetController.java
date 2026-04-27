package ru.florify.employee.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.florify.employee.adapter.in.web.dto.TimesheetActionRequest;
import ru.florify.employee.adapter.in.web.dto.TimesheetEntryResponse;
import ru.florify.employee.adapter.in.web.mapper.TimesheetWebMapper;
import ru.florify.employee.application.command.CheckinCommand;
import ru.florify.employee.application.command.CheckoutCommand;
import ru.florify.employee.application.port.in.TimesheetUseCase;

import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/timesheet")
@RequiredArgsConstructor
public class TimesheetController {

    private final TimesheetUseCase timesheetUseCase;
    private final TimesheetWebMapper mapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','MANAGER')")
    public ResponseEntity<List<TimesheetEntryResponse>> list(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam String month) {
        if (employeeId == null) {
            return ResponseEntity.ok(timesheetUseCase.listAll(YearMonth.parse(month))
                    .stream()
                    .map(mapper::toResponse)
                    .toList());
        }
        return ResponseEntity.ok(timesheetUseCase.list(employeeId, YearMonth.parse(month))
                .stream()
                .map(mapper::toResponse)
                .toList());
    }

    @PostMapping("/checkin")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','MANAGER')")
    public ResponseEntity<TimesheetEntryResponse> checkin(@Valid @RequestBody TimesheetActionRequest request) {
        return ResponseEntity.status(201).body(mapper.toResponse(timesheetUseCase.checkin(new CheckinCommand(request.employeeId()))));
    }

    @PostMapping("/checkout")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','MANAGER')")
    public ResponseEntity<TimesheetEntryResponse> checkout(@Valid @RequestBody TimesheetActionRequest request) {
        return ResponseEntity.ok(mapper.toResponse(timesheetUseCase.checkout(new CheckoutCommand(request.employeeId()))));
    }
}
