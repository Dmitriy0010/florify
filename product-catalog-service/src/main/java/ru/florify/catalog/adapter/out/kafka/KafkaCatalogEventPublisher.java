package ru.florify.catalog.adapter.out.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.internals.RecordHeader;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import ru.florify.catalog.application.port.out.CatalogEventPublisher;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaCatalogEventPublisher implements CatalogEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publish(String topic, String key, Object payload, Map<String, String> traceHeaders) {
        List<Header> headers = new ArrayList<>();
        if (traceHeaders != null) {
            traceHeaders.forEach((k, v) -> 
                headers.add(new RecordHeader(k, v.getBytes(StandardCharsets.UTF_8)))
            );
        }

        ProducerRecord<String, Object> record = new ProducerRecord<>(topic, null, key, payload, headers);

        try {
            kafkaTemplate.send(record).get(10, TimeUnit.SECONDS);
            log.debug("Published event to {}: key={}", topic, key);
        } catch (Exception e) {
            log.error("Failed to publish event to {}: key={}", topic, key, e);
            throw new RuntimeException("Kafka publish failed", e);
        }
    }
}
