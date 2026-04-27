package ru.florify.delivery.application.command;

import java.time.LocalTime;
import java.util.UUID;

/**
 * Команда обновления временного слота доставки (вместимость, время).
 */
public record UpdateDeliverySlotCommand(
        UUID slotId,
        LocalTime startTime,
        LocalTime endTime,
        int maxCapacity,
        UUID performerId
) {}
