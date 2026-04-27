package ru.florify.order.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.order.adapter.out.persistence.entity.PaymentEntity;
import ru.florify.order.adapter.out.persistence.mapper.PaymentJpaMapper;
import ru.florify.order.adapter.out.persistence.repository.JpaPaymentRepository;
import ru.florify.order.application.port.out.PaymentRepository;
import ru.florify.order.domain.model.Payment;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PaymentPersistenceAdapter implements PaymentRepository {

    private final JpaPaymentRepository jpaPaymentRepository;
    private final PaymentJpaMapper paymentMapper;

    @Override
    public Payment save(Payment payment) {
        PaymentEntity entity = paymentMapper.toEntity(payment);
        PaymentEntity saved = jpaPaymentRepository.save(entity);
        return paymentMapper.toDomain(saved);
    }

    @Override
    public Optional<Payment> findById(UUID id) {
        return jpaPaymentRepository.findById(id).map(paymentMapper::toDomain);
    }

    @Override
    public Optional<Payment> findByExternalId(String externalId) {
        return jpaPaymentRepository.findByExternalId(externalId).map(paymentMapper::toDomain);
    }

    @Override
    public Optional<Payment> findLatestByOrderId(UUID orderId) {
        return jpaPaymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId).map(paymentMapper::toDomain);
    }
}
