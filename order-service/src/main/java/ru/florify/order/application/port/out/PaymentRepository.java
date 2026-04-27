package ru.florify.order.application.port.out;

import ru.florify.order.domain.model.Payment;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository {
    Payment save(Payment payment);
    Optional<Payment> findById(UUID id);
    Optional<Payment> findByExternalId(String externalId);
    Optional<Payment> findLatestByOrderId(UUID orderId);
}
