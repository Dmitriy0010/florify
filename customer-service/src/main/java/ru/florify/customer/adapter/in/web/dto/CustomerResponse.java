package ru.florify.customer.adapter.in.web.dto;

import ru.florify.customer.domain.enums.CustomerSource;
import ru.florify.customer.domain.enums.Gender;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CustomerResponse(
    UUID id,
    String phone,
    String email,
    String firstName,
    String lastName,
    LocalDate birthDate,
    Gender gender,
    CustomerSource source,
    List<String> tags,
    UUID userId,
    boolean active,
    Instant createdAt,
    Instant updatedAt
) {}
