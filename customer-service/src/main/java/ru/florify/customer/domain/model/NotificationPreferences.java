package ru.florify.customer.domain.model;

import java.util.UUID;

/**
 * NotificationPreferences — Value Object for client notification settings.
 */
public record NotificationPreferences(
    UUID customerId,
    boolean emailEnabled,
    boolean smsEnabled,
    boolean pushEnabled,
    boolean birthdayPromoEnabled
) {}
