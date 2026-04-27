package ru.florify.catalog.application.port.out;

import java.util.Map;

public interface CatalogEventPublisher {
    void publish(String topic, String key, Object payload, Map<String, String> traceHeaders);
}
