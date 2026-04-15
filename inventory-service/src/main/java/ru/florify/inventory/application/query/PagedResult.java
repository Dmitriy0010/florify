package ru.florify.inventory.application.query;

import java.util.List;

/**
 * Generic pagination result to decouple Application layer from Spring Data.
 */
public record PagedResult<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {}
