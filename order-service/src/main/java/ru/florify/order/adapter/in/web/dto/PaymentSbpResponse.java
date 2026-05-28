package ru.florify.order.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Ответ с данными инициированного СБП-платежа.
 * Используется фронтендом для отображения QR-кода.
 */
public record PaymentSbpResponse(
        UUID id,
        UUID orderId,
        BigDecimal amount,
        String qrCodeData,
        String confirmationUrl,
        String status
) {}
