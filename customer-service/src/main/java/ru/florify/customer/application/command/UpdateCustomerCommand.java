package ru.florify.customer.application.command;

import ru.florify.customer.domain.enums.Gender;
import ru.florify.customer.domain.model.NotificationPreferences;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record UpdateCustomerCommand(
    UUID customerId,
    String email,
    String firstName,
    String lastName,
    LocalDate birthDate,
    Gender gender,
    List<String> tags,                          // Full replacement of tags
    NotificationPreferences notificationPreferences
) {}
