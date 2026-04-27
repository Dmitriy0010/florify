package ru.florify.catalog.application.command;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record UpdateCategoryCommand(
    @NotNull UUID categoryId,
    @NotBlank String name,
    String description,
    boolean active
) {}
