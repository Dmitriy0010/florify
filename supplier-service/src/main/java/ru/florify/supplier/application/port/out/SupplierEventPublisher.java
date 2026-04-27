package ru.florify.supplier.application.port.out;

public interface SupplierEventPublisher {
    void publish(String topic, String key, Object payload);
}
