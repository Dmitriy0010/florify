package ru.florify.supplier.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.florify.common.application.query.PagedResult;
import ru.florify.common.security.UserPrincipal;
import ru.florify.supplier.adapter.in.web.dto.CreateInvoiceRequest;
import ru.florify.supplier.adapter.in.web.dto.InvoiceResponse;
import ru.florify.supplier.adapter.in.web.dto.ReceiveInvoiceRequest;
import ru.florify.supplier.adapter.in.web.mapper.InvoiceWebMapper;
import ru.florify.supplier.application.command.CancelInvoiceCommand;
import ru.florify.supplier.application.command.SubmitInvoiceCommand;
import ru.florify.supplier.application.port.in.*;
import ru.florify.supplier.domain.model.InvoiceStatus;
import ru.florify.supplier.domain.model.PurchaseInvoice;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class InvoiceController {

    private final CreateInvoiceUseCase createInvoiceUseCase;
    private final UpdateInvoiceUseCase updateInvoiceUseCase;
    private final SubmitInvoiceUseCase submitInvoiceUseCase;
    private final ReceiveInvoiceUseCase receiveInvoiceUseCase;
    private final CancelInvoiceUseCase cancelInvoiceUseCase;
    private final GetInvoiceUseCase getInvoiceUseCase;
    private final GetInvoicesUseCase getInvoicesUseCase;
    private final InvoiceWebMapper mapper;

    @GetMapping("/api/v1/invoices")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','SUPPLIER_MANAGER')")
    public ResponseEntity<PagedResult<InvoiceResponse>> getInvoices(
            @RequestParam(required = false) UUID supplierId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        InvoiceStatus statusEnum = status != null ? InvoiceStatus.valueOf(status) : null;
        PagedResult<PurchaseInvoice> result = getInvoicesUseCase.execute(supplierId, statusEnum, from, to, page, size);
        return ResponseEntity.ok(new PagedResult<>(
                result.data().stream().map(mapper::toResponse).toList(),
                result.page(), result.size(), result.totalElements()));
    }

    @GetMapping("/api/v1/invoices/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','SUPPLIER_MANAGER')")
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toResponse(getInvoiceUseCase.execute(id)));
    }

    @PostMapping("/api/v1/invoices")
    @PreAuthorize("hasAnyRole('SUPPLIER_MANAGER','ADMIN','OWNER')")
    public ResponseEntity<InvoiceResponse> createInvoice(
            @Valid @RequestBody CreateInvoiceRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        PurchaseInvoice invoice = createInvoiceUseCase.execute(mapper.toCommand(request, principal.getUserId()));
        return ResponseEntity.status(201).body(mapper.toResponse(invoice));
    }

    @PutMapping("/api/v1/invoices/{id}")
    @PreAuthorize("hasAnyRole('SUPPLIER_MANAGER','ADMIN','OWNER')")
    public ResponseEntity<InvoiceResponse> updateInvoice(
            @PathVariable UUID id,
            @Valid @RequestBody CreateInvoiceRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        PurchaseInvoice invoice = updateInvoiceUseCase.execute(mapper.toCommand(id, request, principal.getUserId()));
        return ResponseEntity.ok(mapper.toResponse(invoice));
    }

    @PostMapping("/api/v1/invoices/{id}/submit")
    @PreAuthorize("hasAnyRole('SUPPLIER_MANAGER','ADMIN','OWNER')")
    public ResponseEntity<Void> submitInvoice(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        submitInvoiceUseCase.execute(new SubmitInvoiceCommand(id, principal.getUserId()));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/v1/invoices/{id}/receive")
    @PreAuthorize("hasAnyRole('SUPPLIER_MANAGER','ADMIN','OWNER')")
    public ResponseEntity<Void> receiveInvoice(
            @PathVariable UUID id,
            @Valid @RequestBody ReceiveInvoiceRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        receiveInvoiceUseCase.execute(mapper.toCommand(id, request, principal.getUserId()));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/v1/invoices/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    public ResponseEntity<Void> cancelInvoice(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal UserPrincipal principal) {
        cancelInvoiceUseCase.execute(new CancelInvoiceCommand(id, reason, principal.getUserId()));
        return ResponseEntity.noContent().build();
    }
}
