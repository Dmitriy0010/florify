package ru.florify.order.adapter.out.payment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import ru.florify.order.application.port.out.PaymentGateway;
import ru.florify.order.domain.model.Payment;

import java.math.BigDecimal;
import java.time.Clock;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class YooKassaPaymentAdapter implements PaymentGateway {

    private final Clock clock;

    @Value("${florify.payments.yookassa.shop-id:test_123}")
    private String shopId;

    @Override
    public Payment createPayment(UUID orderId, BigDecimal amount, String description) {
        log.info("Creating YooKassa SBP payment for order {} amount {}", orderId, amount);

        // В реальном проекте здесь будет вызов API ЮKassa через RestTemplate/WebClient
        // Для дипломной работы мы генерируем "честный" объект платежа с имитацией внешних данных
        
        String externalId = "yo-" + UUID.randomUUID().toString().substring(0, 8);
        
        // Пример ссылки на оплату в ЮKassa
        String confirmationUrl = "https://yoomoney.ru/checkout/payments/v2/contract?orderId=" + externalId;
        
        // Для СБП ЮKassa возвращает данные для QR-кода (payload для генерации)
        // Пример: https://qr.nspk.ru/...
        String qrCodeData = "https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=" 
                + amount.multiply(new BigDecimal(100)).toBigInteger() + "&cur=RUB&crc=ABCD";

        return Payment.createNew(
                orderId,
                amount,
                externalId,
                confirmationUrl,
                qrCodeData,
                clock.instant()
        );
    }
}
