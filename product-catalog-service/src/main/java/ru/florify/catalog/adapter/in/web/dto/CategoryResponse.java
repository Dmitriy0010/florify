package ru.florify.catalog.adapter.in.web.dto;

import java.util.UUID;

public record CategoryResponse(
    UUID id,
    String name,
    String description,
    boolean active
) {}
