package ru.florify.delivery.adapter.in.web.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Ответ с данными временного слота доставки.
 */
public record DeliverySlotResponse(
        UUID id,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        int maxCapacity,
        int currentLoad,
        boolean isFull
) {}
