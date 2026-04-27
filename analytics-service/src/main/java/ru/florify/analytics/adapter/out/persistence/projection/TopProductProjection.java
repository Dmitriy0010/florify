package ru.florify.analytics.adapter.out.persistence.projection;

import java.math.BigDecimal;
import java.util.UUID;

public record TopProductProjection(
        UUID productId,
        String productName,
        BigDecimal quantity,
        BigDecimal revenue
) {}
