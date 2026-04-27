package ru.florify.order.adapter.in.web;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.florify.order.application.port.in.ConfirmPaymentUseCase;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments/webhooks")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final ConfirmPaymentUseCase confirmPaymentUseCase;

    /**
     * Эндпоинт для имитации оплаты (DEBUG MODE для диплома)
     */
    @PostMapping("/simulate/{orderId}")
    public ResponseEntity<Void> simulatePayment(@PathVariable UUID orderId) {
        log.info("DEBUG: Simulating payment webhook for order: {}", orderId);
        confirmPaymentUseCase.executeByOrderId(orderId);
        return ResponseEntity.ok().build();
    }

    /**
     * Реальный эндпоинт для ЮKassa (упрощенно)
     */
    @PostMapping("/yookassa")
    public ResponseEntity<Void> handleYooKassaWebhook(@RequestBody Map<String, Object> payload) {
        log.info("Received YooKassa webhook: {}", payload);
        
        // В реальном коде здесь:
        // 1. Проверка IP ЮKassa
        // 2. Десериализация Notification объекта
        // 3. Вызов confirmPaymentUseCase.execute(externalId)
        
        @SuppressWarnings("unchecked")
        Map<String, Object> object = (Map<String, Object>) payload.get("object");
        if (object != null) {
            String externalId = (String) object.get("id");
            String status = (String) object.get("status");
            
            if ("succeeded".equals(status)) {
                confirmPaymentUseCase.execute(externalId);
            }
        }
        
        return ResponseEntity.ok().build();
    }
}
