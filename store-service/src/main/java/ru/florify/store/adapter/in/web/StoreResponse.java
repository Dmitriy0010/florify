package ru.florify.store.adapter.in.web;

import java.util.UUID;

public record StoreResponse(
    UUID id,
    String name,
    String address,
    String phone,
    boolean active
) {}
