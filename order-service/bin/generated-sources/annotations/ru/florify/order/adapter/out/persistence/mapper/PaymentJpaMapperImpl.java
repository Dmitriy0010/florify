package ru.florify.order.adapter.out.persistence.mapper;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.order.adapter.out.persistence.entity.PaymentEntity;
import ru.florify.order.domain.model.Payment;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:53+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class PaymentJpaMapperImpl implements PaymentJpaMapper {

    @Override
    public PaymentEntity toEntity(Payment domain) {
        if ( domain == null ) {
            return null;
        }

        PaymentEntity.PaymentEntityBuilder paymentEntity = PaymentEntity.builder();

        paymentEntity.amount( domain.getAmount() );
        paymentEntity.confirmationUrl( domain.getConfirmationUrl() );
        paymentEntity.createdAt( domain.getCreatedAt() );
        paymentEntity.externalId( domain.getExternalId() );
        paymentEntity.id( domain.getId() );
        paymentEntity.orderId( domain.getOrderId() );
        paymentEntity.qrCodeData( domain.getQrCodeData() );
        paymentEntity.status( domain.getStatus() );
        paymentEntity.updatedAt( domain.getUpdatedAt() );

        return paymentEntity.build();
    }

    @Override
    public Payment toDomain(PaymentEntity entity) {
        if ( entity == null ) {
            return null;
        }

        Payment.PaymentBuilder payment = Payment.builder();

        payment.amount( entity.getAmount() );
        payment.confirmationUrl( entity.getConfirmationUrl() );
        payment.createdAt( entity.getCreatedAt() );
        payment.externalId( entity.getExternalId() );
        payment.id( entity.getId() );
        payment.orderId( entity.getOrderId() );
        payment.qrCodeData( entity.getQrCodeData() );
        payment.status( entity.getStatus() );
        payment.updatedAt( entity.getUpdatedAt() );

        return payment.build();
    }
}
