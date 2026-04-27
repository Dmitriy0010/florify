package ru.florify.order.application.port.out;

import ru.florify.order.domain.model.Payment;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentGateway {
    Payment createPayment(UUID orderId, BigDecimal amount, String description);
}
