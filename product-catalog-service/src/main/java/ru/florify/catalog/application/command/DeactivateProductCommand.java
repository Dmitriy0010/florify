package ru.florify.catalog.application.command;

import java.util.UUID;

public record DeactivateProductCommand(
    UUID productId,
    UUID performerId
) {}
