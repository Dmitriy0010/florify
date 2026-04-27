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
import ru.florify.common.security.UserPrincipal;
import ru.florify.delivery.adapter.in.web.dto.CreateDeliverySlotRequest;
import ru.florify.delivery.adapter.in.web.dto.DeliverySlotResponse;
import ru.florify.delivery.adapter.in.web.dto.UpdateDeliverySlotRequest;
import ru.florify.delivery.adapter.in.web.mapper.DeliverySlotWebMapper;
import ru.florify.delivery.application.port.in.DeliverySlotUseCase;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/delivery/slots")
@RequiredArgsConstructor
@Tag(name = "Delivery Slots", description = "Delivery time slot management")
public class DeliverySlotController {

    private final DeliverySlotUseCase slotUseCase;
    private final DeliverySlotWebMapper mapper;

    @GetMapping
    @Operation(summary = "List delivery slots by date (defaults to today)")
    public ResponseEntity<List<DeliverySlotResponse>> getByDate(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        List<DeliverySlotResponse> slots = slotUseCase.getByDate(queryDate).stream()
                .map(mapper::toResponse)
                .toList();
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get delivery slot by ID")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<DeliverySlotResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toResponse(slotUseCase.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create delivery slot")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<DeliverySlotResponse> create(
            @Valid @RequestBody CreateDeliverySlotRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        DeliverySlotResponse response = mapper.toResponse(
                slotUseCase.create(mapper.toCommand(request, principal.getUserId()))
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update delivery slot")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<DeliverySlotResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDeliverySlotRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(
                mapper.toResponse(slotUseCase.update(mapper.toCommand(request, id, principal.getUserId())))
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete delivery slot (only if no active tasks)")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        slotUseCase.delete(id, principal.getUserId());
        return ResponseEntity.noContent().build();
    }
}
