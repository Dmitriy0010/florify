package ru.florify.order.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.florify.order.adapter.out.persistence.entity.PaymentEntity;

import java.util.Optional;
import java.util.UUID;

public interface JpaPaymentRepository extends JpaRepository<PaymentEntity, UUID> {
    Optional<PaymentEntity> findByExternalId(String externalId);
    Optional<PaymentEntity> findFirstByOrderIdOrderByCreatedAtDesc(UUID orderId);
}
