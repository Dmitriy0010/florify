package ru.florify.order.domain.model;

public enum PaymentStatus {
    PENDING,
    SUCCEEDED,
    CANCELED,
    WAITING_FOR_CAPTURE
}
