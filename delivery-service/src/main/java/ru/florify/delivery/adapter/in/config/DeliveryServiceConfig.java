package ru.florify.delivery.adapter.in.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;

import java.time.Clock;

/**
 * Конфигурация модуля delivery-service.
 *
 * EnableRetry — для @Retryable в CreateDeliveryTaskInteractor (Optimistic Lock retry).
 * EnableAsync — для async @EventListener (если понадобится неблокирующая обработка событий).
 */
@Configuration
@EnableRetry
@EnableAsync
public class DeliveryServiceConfig {
}
