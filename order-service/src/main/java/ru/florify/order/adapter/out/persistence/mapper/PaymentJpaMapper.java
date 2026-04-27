package ru.florify.order.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ru.florify.order.adapter.out.persistence.entity.PaymentEntity;
import ru.florify.order.domain.model.Payment;

@Mapper(componentModel = "spring")
public interface PaymentJpaMapper {
    PaymentEntity toEntity(Payment domain);
    Payment toDomain(PaymentEntity entity);
}
