package ru.florify.order.domain.model;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItem(
        UUID productId,
        String productName,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal  // quantity * unitPrice
) {
    public OrderItem {
        if (lineTotal == null) {
            lineTotal = quantity.multiply(unitPrice);
        }
    }
}
