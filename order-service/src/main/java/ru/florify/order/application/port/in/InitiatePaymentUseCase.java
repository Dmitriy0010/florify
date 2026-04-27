package ru.florify.order.application.port.in;

import ru.florify.order.domain.model.Payment;

import java.util.UUID;

public interface InitiatePaymentUseCase {
    Payment execute(UUID orderId);
}
