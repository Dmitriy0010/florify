package ru.florify.delivery.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.florify.common.security.UserPrincipal;
import ru.florify.delivery.adapter.in.web.dto.CreateDeliveryZoneRequest;
import ru.florify.delivery.adapter.in.web.dto.DeliveryZoneResponse;
import ru.florify.delivery.adapter.in.web.dto.UpdateDeliveryZoneRequest;
import ru.florify.delivery.adapter.in.web.mapper.DeliveryZoneWebMapper;
import ru.florify.delivery.application.port.in.DeliveryZoneUseCase;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/delivery/zones")
@RequiredArgsConstructor
@Tag(name = "Delivery Zones", description = "Delivery zone management")
public class DeliveryZoneController {

    private final DeliveryZoneUseCase zoneUseCase;
    private final DeliveryZoneWebMapper mapper;

    @GetMapping
    @Operation(summary = "List active delivery zones")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','CASHIER')")
    public ResponseEntity<List<DeliveryZoneResponse>> getAll() {
        List<DeliveryZoneResponse> zones = zoneUseCase.getAll().stream()
                .map(mapper::toResponse)
                .toList();
        return ResponseEntity.ok(zones);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get delivery zone by ID")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<DeliveryZoneResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toResponse(zoneUseCase.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create delivery zone")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<DeliveryZoneResponse> create(
            @Valid @RequestBody CreateDeliveryZoneRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        DeliveryZoneResponse response = mapper.toResponse(
                zoneUseCase.create(mapper.toCommand(request, principal.getUserId()))
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update delivery zone")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<DeliveryZoneResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDeliveryZoneRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(
                mapper.toResponse(zoneUseCase.update(mapper.toCommand(request, id, principal.getUserId())))
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate delivery zone (soft delete)")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deactivate(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        zoneUseCase.deactivate(id, principal.getUserId());
        return ResponseEntity.noContent().build();
    }
}
