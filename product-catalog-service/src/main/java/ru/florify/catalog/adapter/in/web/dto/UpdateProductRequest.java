package ru.florify.catalog.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record UpdateProductRequest(
    @NotBlank String name,
    String description,
    @NotNull UUID categoryId,
    String imageUrl,
    int defaultShelfLifeDays
) {}
