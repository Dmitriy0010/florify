package ru.florify.customer.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import ru.florify.customer.domain.enums.Gender;

import java.time.LocalDate;

public record CreateCustomerRequest(
    @NotBlank String phone,
    String email,
    @NotBlank String firstName,
    String lastName,
    LocalDate birthDate,
    Gender gender
) {}
