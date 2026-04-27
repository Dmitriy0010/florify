package ru.florify.inventory.application.port.in;

import java.util.UUID;

public record GetStocksQuery(
    UUID storeId,
    boolean includeArchived
) {}
