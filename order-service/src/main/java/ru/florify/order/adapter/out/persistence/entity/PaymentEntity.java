package ru.florify.order.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.florify.order.domain.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentEntity {

    @Id
    private UUID id;

    private String externalId;

    @Column(nullable = false)
    private UUID orderId;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String confirmationUrl;

    @Column(columnDefinition = "TEXT")
    private String qrCodeData;

    private Instant createdAt;
    private Instant updatedAt;
}
