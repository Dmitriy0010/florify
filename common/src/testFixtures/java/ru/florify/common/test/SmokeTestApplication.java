package ru.florify.common.test;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;

/**
 * A shared minimal application context for smoke testing across all modules.
 * This avoids classpath pollution and ensures a stable, slim context.
 */
@SpringBootApplication
public class SmokeTestApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmokeTestApplication.class, args);
    }
}
