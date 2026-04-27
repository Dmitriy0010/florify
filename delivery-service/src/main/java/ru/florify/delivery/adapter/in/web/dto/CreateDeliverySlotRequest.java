package ru.florify.delivery.adapter.in.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Запрос на создание временного слота доставки.
 */
public record CreateDeliverySlotRequest(
        @NotNull LocalDate date,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @Min(1) int maxCapacity
) {}
