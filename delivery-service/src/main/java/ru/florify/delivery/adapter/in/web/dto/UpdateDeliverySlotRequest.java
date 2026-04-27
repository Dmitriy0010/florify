package ru.florify.delivery.adapter.in.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

/**
 * Запрос на обновление временного слота (вместимость, время).
 */
public record UpdateDeliverySlotRequest(
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @Min(1) int maxCapacity
) {}
