package ru.florify.inventory.application.port.in;

import java.util.UUID;

public record StockBalanceQuery(
    UUID productId,
    UUID storeId
) {}
