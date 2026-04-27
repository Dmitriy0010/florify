package ru.florify.order.adapter.in.web;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import ru.florify.order.domain.event.PaymentSucceededEvent;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentWebSocketListener {

    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handlePaymentSucceeded(PaymentSucceededEvent event) {
        log.info("Sending payment success notification for order {} via WebSocket", event.getOrderId());
        
        // Отправляем уведомление в топик конкретного заказа
        messagingTemplate.convertAndSend(
                "/topic/orders/" + event.getOrderId(),
                event
        );
    }
}
