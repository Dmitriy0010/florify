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
    private final ru.florify.inventory.application.port.in.GetStockTransactionUseCase getStockTransactionUseCase;
    private final ru.florify.inventory.application.port.in.GetAllStockBalancesUseCase getAllStockBalancesUseCase;
    private final ru.florify.inventory.application.port.in.GetWriteOffLogsUseCase getWriteOffLogsUseCase;
    private final ru.florify.inventory.application.port.in.GetProductHistoryUseCase getProductHistoryUseCase;
    private final ru.florify.inventory.application.port.in.GetProductBatchesUseCase getProductBatchesUseCase;
    private final StockWebMapper mapper;

    @GetMapping("/balance/all")
    @Operation(summary = "Get all stock balances", description = "Retrieves enriched stock levels for all products in a store.")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'FLORIST', 'CASHIER')")
    public ResponseEntity<java.util.List<ru.florify.inventory.adapter.in.web.dto.EnhancedStockBalanceResponse>> getAllBalances(
            @RequestParam(required = false) UUID storeId,
            @RequestParam(required = false, defaultValue = "false") boolean includeArchived
    ) {
        return ResponseEntity.ok(getAllStockBalancesUseCase.execute(
                new ru.florify.inventory.application.port.in.GetStocksQuery(storeId, includeArchived)
        ));
    }

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
    public ResponseEntity<StockBalanceResponse> getBalance(
            @PathVariable UUID productId,
            @RequestParam(required = false) UUID storeId
    ) {
        StockBalance balance = getStockBalanceUseCase.execute(
                new ru.florify.inventory.application.port.in.StockBalanceQuery(productId, storeId)
        );
        return ResponseEntity.ok(mapper.toResponse(balance));
    }

    @GetMapping("/write-offs")
    @Operation(summary = "Get write-off logs", description = "Retrieves the history of stock write-offs.")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'FLORIST')")
    public ResponseEntity<java.util.List<ru.florify.inventory.adapter.in.web.dto.WriteOffLogResponse>> getWriteOffLogs() {
        return ResponseEntity.ok(getWriteOffLogsUseCase.execute());
    }

    @GetMapping("/transactions/{productId}")
    @Operation(summary = "Get product history", description = "Retrieves the transaction history for a specific product.")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'FLORIST', 'CASHIER')")
    public ResponseEntity<ru.florify.inventory.application.query.PagedResult<ru.florify.inventory.domain.model.StockTransaction>> getProductHistory(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(getProductHistoryUseCase.execute(productId, page, size));
    }

    @GetMapping("/batches/{productId}")
    @Operation(summary = "Get product batches", description = "Retrieves all stock batches (partii) for a specific product with remaining quantities and supplier info.")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'FLORIST', 'CASHIER')")
    public ResponseEntity<java.util.List<ru.florify.inventory.adapter.in.web.dto.StockBatchDto>> getProductBatches(
            @PathVariable UUID productId
    ) {
        java.util.List<ru.florify.inventory.domain.model.StockBatch> batches = getProductBatchesUseCase.execute(productId);
        java.util.List<ru.florify.inventory.adapter.in.web.dto.StockBatchDto> dtos = batches.stream()
                .map(b -> new ru.florify.inventory.adapter.in.web.dto.StockBatchDto(
                        b.getId(),
                        b.getSupplierId(),
                        null, // supplierName enriched on client side
                        b.getQuantityReceived(),
                        b.getQuantityRemaining(),
                        b.getUnitCost(),
                        b.getReceivedAt(),
                        b.getExpiresAt(),
                        b.getStatus(),
                        b.getSourceDocumentId()
                ))
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/transaction/{transactionId}")
    @Operation(summary = "Get single transaction", description = "Retrieves details of a specific stock transaction by its ID.")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'FLORIST')")
    public ResponseEntity<ru.florify.inventory.domain.model.StockTransaction> getTransaction(@PathVariable UUID transactionId) {
        return ResponseEntity.ok(getStockTransactionUseCase.execute(transactionId));
    }

    /**
     * Public endpoint — no auth required.
     * Used by the customer storefront to check product availability in a selected store.
     *
     * GET /api/v1/inventory/public/availability?storeId=UUID&productIds=uuid1,uuid2,...
     * Response: { "productId1": true, "productId2": false, ... }
     * true  = in stock (quantity > 0)
     * false = out of stock
     */
    @GetMapping("/public/availability")
    @Operation(summary = "Public batch availability check",
               description = "Returns in-stock status for a list of products in a given store. No authentication required.")
    public ResponseEntity<java.util.Map<String, Boolean>> getPublicAvailability(
            @RequestParam UUID storeId,
            @RequestParam java.util.List<UUID> productIds
    ) {
        java.util.Map<String, Boolean> result = new java.util.LinkedHashMap<>();
        for (UUID productId : productIds) {
            try {
                ru.florify.inventory.domain.model.StockBalance balance =
                        getStockBalanceUseCase.execute(new ru.florify.inventory.application.port.in.StockBalanceQuery(productId, storeId));
                result.put(productId.toString(), balance != null && balance.getQuantityInStock() != null
                        && balance.getQuantityInStock().compareTo(java.math.BigDecimal.ZERO) > 0);
            } catch (Exception e) {
                // Product not found in this store — treat as out of stock
                result.put(productId.toString(), false);
            }
        }
        return ResponseEntity.ok(result);
    }
}

