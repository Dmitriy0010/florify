package ru.florify.order.application.port.in;

import java.util.UUID;

public interface ConfirmPaymentUseCase {
    void execute(String externalId);
    void executeByOrderId(UUID orderId); // Для имитации оплаты вручную
}
