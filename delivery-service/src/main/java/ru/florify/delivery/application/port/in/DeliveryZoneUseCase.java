package ru.florify.delivery.application.port.in;

import ru.florify.delivery.application.command.CreateDeliveryZoneCommand;
import ru.florify.delivery.application.command.UpdateDeliveryZoneCommand;
import ru.florify.delivery.domain.model.DeliveryZone;

import java.util.List;
import java.util.UUID;

/**
 * Входной порт (API) для управления зонами доставки.
 * Имплементируется в DeliveryZoneInteractor.
 */
public interface DeliveryZoneUseCase {

    DeliveryZone create(CreateDeliveryZoneCommand command);

    DeliveryZone update(UpdateDeliveryZoneCommand command);

    DeliveryZone getById(UUID id);

    List<DeliveryZone> getAll();

    void deactivate(UUID id, UUID performerId);
}
