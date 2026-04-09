package ru.florify.inventory.presentation.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import ru.florify.inventory.domain.model.WriteOffReason;

import java.math.BigDecimal;
import java.util.UUID;

public record WriteOffRequest(
        @NotNull(message = "Product ID is mandatory")
        UUID productId,
        
        @NotNull(message = "Quantity is mandatory")
        @Positive(message = "Quantity must be greater than zero")
        BigDecimal quantity,
        
        WriteOffReason reason, // Optional
        String comment,        // Optional
        
        @NotBlank(message = "Source document ID is mandatory")
        String sourceDocumentId
) {}
