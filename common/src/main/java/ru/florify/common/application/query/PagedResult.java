package ru.florify.common.application.query;

import java.util.List;

public record PagedResult<T>(
    List<T> data,
    int page,
    int size,
    long totalElements
) {
}
