package ru.florify.catalog.application.query;

import java.util.UUID;

public record GetCatalogQuery(
    UUID categoryId,       // nullable
    String searchTerm,     // nullable, search by name/sku
    Boolean active,        // null = all, true = only active
    int page,
    int size
) {}
