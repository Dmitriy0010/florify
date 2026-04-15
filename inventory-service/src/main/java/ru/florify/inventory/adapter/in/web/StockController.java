package ru.florify.inventory.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.florify.common.security.UserPrincipal;
import ru.florify.inventory.adapter.in.web.dto.ReceiveStockRequest;
import ru.florify.inventory.adapter.in.web.dto.StockBalanceResponse;
import ru.florify.inventory.adapter.in.web.dto.WriteOffRequest;
import ru.florify.inventory.adapter.in.web.mapper.StockWebMapper;
import ru.florify.inventory.application.port.in.GetStockBalanceUseCase;
import ru.florify.inventory.application.port.in.ReceiveStockUseCase;
import ru.florify.inventory.application.port.in.WriteOffStockUseCase;
import ru.florify.inventory.domain.model.StockBalance;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Stock Operations", description = "Endpoints for managing stock levels and transactions")
public class StockController {
    private final ReceiveStockUseCase receiveStockUseCase;
    private final WriteOffStockUseCase writeOffStockUseCase;
    private final GetStockBalanceUseCase getStockBalanceUseCase;
    private final StockWebMapper mapper;

    @PostMapping("/receive")
    @Operation(summary = "Receive stock", description = "Increases stock levels. Managers only.")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'SUPPLIER_MANAGER')")
    public ResponseEntity<Void> receiveStock(
            @Valid @RequestBody ReceiveStockRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        receiveStockUseCase.execute(mapper.toCommand(request, principal.getUserId()));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/write-off")
    @Operation(summary = "Write off stock", description = "Decreases stock levels due to damage or expiration.")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'FLORIST')")
    public ResponseEntity<Void> writeOffStock(
            @Valid @RequestBody WriteOffRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        writeOffStockUseCase.execute(mapper.toCommand(request, principal.getUserId()));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/balance/{productId}")
    @Operation(summary = "Get stock balance", description = "Retrieves current quantity and WAC for a product.")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'FLORIST', 'CASHIER')")
    public ResponseEntity<StockBalanceResponse> getBalance(@PathVariable UUID productId) {
        StockBalance balance = getStockBalanceUseCase.execute(productId);
        return ResponseEntity.ok(mapper.toResponse(balance));
    }
}
