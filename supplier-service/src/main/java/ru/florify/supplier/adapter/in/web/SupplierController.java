package ru.florify.supplier.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.florify.common.application.query.PagedResult;
import ru.florify.supplier.adapter.in.web.dto.CreateSupplierRequest;
import ru.florify.supplier.adapter.in.web.dto.SupplierResponse;
import ru.florify.supplier.adapter.in.web.dto.SupplierSummaryResponse;
import ru.florify.supplier.adapter.in.web.dto.UpdateSupplierRequest;
import ru.florify.supplier.adapter.in.web.mapper.SupplierWebMapper;
import ru.florify.supplier.application.port.in.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final CreateSupplierUseCase createSupplierUseCase;
    private final UpdateSupplierUseCase updateSupplierUseCase;
    private final GetSupplierUseCase getSupplierUseCase;
    private final GetSuppliersUseCase getSuppliersUseCase;
    private final DeactivateSupplierUseCase deactivateSupplierUseCase;
    private final SupplierWebMapper mapper;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPPLIER_MANAGER','ADMIN','OWNER')")
    public ResponseEntity<SupplierResponse> create(@Valid @RequestBody CreateSupplierRequest request) {
        return ResponseEntity.status(201).body(mapper.toResponse(createSupplierUseCase.execute(mapper.toCommand(request))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPPLIER_MANAGER','ADMIN','OWNER')")
    public ResponseEntity<SupplierResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdateSupplierRequest request) {
        return ResponseEntity.ok(mapper.toResponse(updateSupplierUseCase.execute(mapper.toCommand(id, request))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','SUPPLIER_MANAGER')")
    public ResponseEntity<SupplierResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toResponse(getSupplierUseCase.execute(id)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN','SUPPLIER_MANAGER')")
    public ResponseEntity<PagedResult<SupplierSummaryResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResult<ru.florify.supplier.domain.model.Supplier> result = getSuppliersUseCase.execute(search, active, page, size);
        return ResponseEntity.ok(new PagedResult<>(
                result.data().stream().map(mapper::toSummaryResponse).toList(),
                result.page(), result.size(), result.totalElements()));
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    public ResponseEntity<Void> deactivate(@PathVariable UUID id) {
        deactivateSupplierUseCase.execute(id);
        return ResponseEntity.noContent().build();
    }
}
