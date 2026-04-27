package ru.florify.order.domain.event;

import lombok.Value;

import java.util.UUID;

@Value
public class PaymentSucceededEvent {
    UUID orderId;
    String orderNumber;
    boolean isPaid;
}
