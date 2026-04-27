package ru.florify.delivery.application.command;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Команда создания временного слота доставки.
 */
public record CreateDeliverySlotCommand(
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        int maxCapacity,
        UUID performerId
) {}
