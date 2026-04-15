package ru.florify.customer.adapter.in.web.dto;

import java.util.UUID;

public record CustomerSummaryResponse(
    UUID id,
    String phone,
    String firstName,
    String lastName,
    boolean active
) {}
