package ru.florify.order.domain.model;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter(AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder(toBuilder = true)
public class Payment {
    private UUID id;
    private String externalId; // ID транзакции в ЮKassa
    private UUID orderId;
    private BigDecimal amount;
    private PaymentStatus status;
    private String confirmationUrl; // Ссылка для перехода к оплате
    private String qrCodeData;      // Данные для генерации QR-кода (если есть)
    private Instant createdAt;
    private Instant updatedAt;

    public static Payment createNew(UUID orderId, BigDecimal amount, String externalId, String confirmationUrl, String qrCodeData, Instant now) {
        return Payment.builder()
                .id(UUID.randomUUID())
                .orderId(orderId)
                .amount(amount)
                .externalId(externalId)
                .status(PaymentStatus.PENDING)
                .confirmationUrl(confirmationUrl)
                .qrCodeData(qrCodeData)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    public Payment succeed(Instant now) {
        return this.toBuilder()
                .status(PaymentStatus.SUCCEEDED)
                .updatedAt(now)
                .build();
    }

    public Payment fail(Instant now) {
        return this.toBuilder()
                .status(PaymentStatus.CANCELED)
                .updatedAt(now)
                .build();
    }
}
