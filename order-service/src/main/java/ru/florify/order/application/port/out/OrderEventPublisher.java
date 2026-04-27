package ru.florify.order.application.port.out;

public interface OrderEventPublisher {
    void publish(String topic, String key, Object payload);
}
