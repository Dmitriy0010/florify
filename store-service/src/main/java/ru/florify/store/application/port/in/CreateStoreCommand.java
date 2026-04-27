package ru.florify.store.application.port.in;

import java.util.UUID;

public record CreateStoreCommand(
    String name,
    String address,
    String phone,
    boolean active
) {}
