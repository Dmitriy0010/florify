package ru.florify.delivery.adapter.in.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Конфигурация модуля delivery-service.
 *
 * EnableRetry     — для @Retryable в CreateDeliveryTaskInteractor (Optimistic Lock retry).
 * EnableAsync     — для async @EventListener (неблокирующая обработка событий).
 * EnableScheduling — для @Scheduled задач (автогенерация слотов доставки).
 */
@Configuration
@EnableRetry
@EnableAsync
@EnableScheduling
public class DeliveryServiceConfig {
}
