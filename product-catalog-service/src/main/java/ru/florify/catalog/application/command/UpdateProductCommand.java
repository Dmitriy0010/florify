package ru.florify.catalog.application.command;

import java.util.UUID;

public record UpdateProductCommand(
    UUID productId,
    String name,
    String description,
    UUID categoryId,
    String imageUrl,
    int defaultShelfLifeDays,
    UUID performerId
) {}
