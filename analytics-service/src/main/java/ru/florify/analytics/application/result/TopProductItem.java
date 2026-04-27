package ru.florify.analytics.application.result;

import java.math.BigDecimal;
import java.util.UUID;

public record TopProductItem(
        UUID productId,
        String productName,
        BigDecimal quantity,
        BigDecimal revenue
) {}
