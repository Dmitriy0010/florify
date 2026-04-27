package ru.florify.delivery.application.command;

import java.time.Instant;
import java.util.UUID;

/**
 * Команда создания задачи доставки.
 *
 * slotId — nullable (самовывоз или назначение слота позже).
 * zoneId — nullable (определяется по адресу позже или вручную).
 * latitude/longitude — nullable (заполняются при геокодировании адреса).
 */
public record CreateDeliveryTaskCommand(
        UUID orderId,
        UUID slotId,
        UUID zoneId,
        String deliveryAddress,
        Double latitude,
        Double longitude,
        Instant estimatedArrival,
        UUID performerId
) {}
