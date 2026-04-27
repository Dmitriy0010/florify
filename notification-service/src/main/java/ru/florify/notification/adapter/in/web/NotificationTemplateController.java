package ru.florify.notification.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.florify.notification.adapter.in.web.dto.NotificationTemplateResponse;
import ru.florify.notification.adapter.in.web.dto.UpsertTemplateRequest;
import ru.florify.notification.adapter.in.web.mapper.NotificationWebMapper;
import ru.florify.notification.application.port.in.NotificationTemplateUseCase;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications/templates")
@RequiredArgsConstructor
public class NotificationTemplateController {

    private final NotificationTemplateUseCase templateUseCase;
    private final NotificationWebMapper mapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<List<NotificationTemplateResponse>> list() {
        return ResponseEntity.ok(templateUseCase.list().stream().map(mapper::toResponse).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<NotificationTemplateResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toResponse(templateUseCase.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<NotificationTemplateResponse> create(@Valid @RequestBody UpsertTemplateRequest request) {
        return ResponseEntity.status(201).body(mapper.toResponse(templateUseCase.upsert(mapper.toCommand(request))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<NotificationTemplateResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpsertTemplateRequest request
    ) {
        return ResponseEntity.ok(mapper.toResponse(templateUseCase.upsert(mapper.toCommand(id, request))));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<NotificationTemplateResponse> activate(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toResponse(templateUseCase.activate(id)));
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<NotificationTemplateResponse> deactivate(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toResponse(templateUseCase.deactivate(id)));
    }
}

