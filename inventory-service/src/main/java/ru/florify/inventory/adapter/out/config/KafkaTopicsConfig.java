package ru.florify.inventory.adapter.out.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicsConfig {

    @Bean
    public NewTopic inventoryStockReceivedTopic() {
        return TopicBuilder.name("inventory.stock.received")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic inventoryStockWrittenOffTopic() {
        return TopicBuilder.name("inventory.stock.written-off")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic inventoryStockExpiredTopic() {
        return TopicBuilder.name("inventory.stock.expired")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
