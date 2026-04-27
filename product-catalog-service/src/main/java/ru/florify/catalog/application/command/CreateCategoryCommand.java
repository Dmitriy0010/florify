package ru.florify.catalog.application.command;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record CreateCategoryCommand(
    @NotBlank String name,
    String description
) {}
