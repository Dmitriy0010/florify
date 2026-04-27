package ru.florify.delivery.application.port.in;

import ru.florify.delivery.application.command.CreateDeliverySlotCommand;
import ru.florify.delivery.application.command.UpdateDeliverySlotCommand;
import ru.florify.delivery.domain.model.DeliverySlot;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Входной порт (API) для управления временными слотами доставки.
 * Имплементируется в DeliverySlotInteractor.
 */
public interface DeliverySlotUseCase {

    DeliverySlot create(CreateDeliverySlotCommand command);

    DeliverySlot update(UpdateDeliverySlotCommand command);

    DeliverySlot getById(UUID id);

    List<DeliverySlot> getByDate(LocalDate date);

    void delete(UUID id, UUID performerId);
}
