package ru.florify.delivery.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.florify.common.exception.DomainException;
import ru.florify.common.security.UserPrincipal;
import ru.florify.delivery.adapter.in.web.dto.AssignCourierRequest;
import ru.florify.delivery.adapter.in.web.dto.CreateDeliveryTaskRequest;
import ru.florify.delivery.adapter.in.web.dto.DeliveryTaskResponse;
import ru.florify.delivery.adapter.in.web.dto.UpdateTaskStatusRequest;
import ru.florify.delivery.adapter.in.web.mapper.DeliveryTaskWebMapper;
import ru.florify.delivery.application.port.in.AssignCourierUseCase;
import ru.florify.delivery.application.port.in.CreateDeliveryTaskUseCase;
import ru.florify.delivery.application.port.in.UpdateTaskStatusUseCase;
import ru.florify.delivery.application.port.out.DeliveryTaskRepository;
import ru.florify.delivery.domain.model.TaskStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/delivery/tasks")
@RequiredArgsConstructor
@Tag(name = "Delivery Tasks", description = "Delivery task lifecycle management")
public class DeliveryTaskController {

    private final CreateDeliveryTaskUseCase createTaskUseCase;
    private final AssignCourierUseCase assignCourierUseCase;
    private final UpdateTaskStatusUseCase updateStatusUseCase;
    private final DeliveryTaskRepository taskRepository;
    private final DeliveryTaskWebMapper mapper;

    @GetMapping
    @Operation(summary = "List delivery tasks with filters")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<List<DeliveryTaskResponse>> getTasks(
            @RequestParam(required = false) UUID courierId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) TaskStatus status
    ) {
        List<DeliveryTaskResponse> tasks;

        if (courierId != null) {
            tasks = taskRepository.findByCourierId(courierId).stream()
                    .map(mapper::toResponse).toList();
        } else if (status != null && date != null) {
            tasks = taskRepository.findByStatusAndDate(status, date).stream()
                    .map(mapper::toResponse).toList();
        } else {
            // По умолчанию — задачи на сегодня в статусе CREATED и ASSIGNED
            LocalDate queryDate = (date != null) ? date : LocalDate.now();
            tasks = taskRepository.findByStatusAndDate(TaskStatus.CREATED, queryDate).stream()
                    .map(mapper::toResponse).toList();
        }

        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/my")
    @Operation(summary = "Get current courier's own tasks")
    @PreAuthorize("hasRole('COURIER')")
    public ResponseEntity<List<DeliveryTaskResponse>> getMy(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<DeliveryTaskResponse> tasks = taskRepository.findByCourierId(principal.getUserId()).stream()
                .map(mapper::toResponse)
                .toList();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get delivery task by ID")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','COURIER')")
    public ResponseEntity<DeliveryTaskResponse> getById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        var task = taskRepository.findById(id)
                .orElseThrow(() -> new ru.florify.delivery.domain.exception.DeliveryTaskNotFoundException(id));

        // IDOR-защита: курьер видит только свои задачи
        if (principal.getRoles().contains("ROLE_COURIER")) {
            if (task.getCourierId() == null || !task.getCourierId().equals(principal.getUserId())) {
                throw new ru.florify.common.exception.ForbiddenException("Access denied: not your task");
            }
        }

        return ResponseEntity.ok(mapper.toResponse(task));
    }

    @PostMapping
    @Operation(summary = "Manually create delivery task (ADMIN)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeliveryTaskResponse> create(
            @Valid @RequestBody CreateDeliveryTaskRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        DeliveryTaskResponse response = mapper.toResponse(
                createTaskUseCase.execute(mapper.toCommand(request, principal.getUserId()))
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/assign")
    @Operation(summary = "Assign courier to delivery task")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeliveryTaskResponse> assignCourier(
            @PathVariable UUID id,
            @Valid @RequestBody AssignCourierRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(
                mapper.toResponse(assignCourierUseCase.execute(mapper.toCommand(id, request, principal.getUserId())))
        );
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update delivery task status (COURIER/ADMIN)")
    @PreAuthorize("hasAnyRole('COURIER','ADMIN')")
    public ResponseEntity<DeliveryTaskResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        // Валидация: failureReason обязателен при FAILED
        if (request.newStatus() == TaskStatus.FAILED &&
                (request.failureReason() == null || request.failureReason().isBlank())) {
            throw new DomainException("VALIDATION_ERROR", "failureReason is required when newStatus is FAILED");
        }

        return ResponseEntity.ok(
                mapper.toResponse(updateStatusUseCase.execute(mapper.toCommand(id, request, principal.getUserId())))
        );
    }
}
