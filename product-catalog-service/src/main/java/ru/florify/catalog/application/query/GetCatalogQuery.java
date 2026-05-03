package ru.florify.catalog.application.query;

import java.util.UUID;

public record GetCatalogQuery(
    UUID categoryId,       // nullable
    UUID storeId,          // nullable, filter by availability in store
    String searchTerm,     // nullable, search by name/sku
    Boolean active,        // null = all, true = only active
    int page,
    int size
) {}

