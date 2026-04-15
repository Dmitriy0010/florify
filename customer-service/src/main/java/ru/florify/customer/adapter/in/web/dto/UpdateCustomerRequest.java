package ru.florify.customer.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import ru.florify.customer.domain.enums.Gender;

import java.time.LocalDate;
import java.util.List;

public record UpdateCustomerRequest(
    @NotBlank String firstName,
    String lastName,
    String email,
    LocalDate birthDate,
    Gender gender,
    List<String> tags
) {}
