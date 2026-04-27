package ru.florify.inventory.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.UUID;

public record ReceiveStockRequest(
    @NotNull(message = "Product ID is mandatory")
    UUID productId,
    
    @NotNull(message = "Store ID is mandatory")
    UUID storeId,

    UUID supplierId,
    
    @NotNull(message = "Quantity is mandatory")
    @Positive(message = "Quantity must be greater than zero")
    BigDecimal quantity,
    
    @NotNull(message = "Purchase price is mandatory")
    @PositiveOrZero(message = "Purchase price cannot be negative")
    BigDecimal purchasePrice,
    
    String sourceDocumentId
) {}
