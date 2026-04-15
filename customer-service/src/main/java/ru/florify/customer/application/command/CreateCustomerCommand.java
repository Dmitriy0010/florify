package ru.florify.customer.application.command;

import ru.florify.customer.domain.enums.CustomerSource;
import ru.florify.customer.domain.enums.Gender;
import java.time.LocalDate;
import java.util.UUID;

public record CreateCustomerCommand(
    String phone,
    String email,
    String firstName,
    String lastName,
    LocalDate birthDate,
    Gender gender,
    CustomerSource source,
    UUID userId                 // nullable
) {}
