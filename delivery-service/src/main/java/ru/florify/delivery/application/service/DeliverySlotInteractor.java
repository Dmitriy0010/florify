package ru.florify.delivery.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.exception.ConflictException;
import ru.florify.delivery.application.command.CreateDeliverySlotCommand;
import ru.florify.delivery.application.command.UpdateDeliverySlotCommand;
import ru.florify.delivery.application.port.in.DeliverySlotUseCase;
import ru.florify.delivery.application.port.out.DeliverySlotRepository;
import ru.florify.delivery.domain.exception.DeliverySlotNotFoundException;
import ru.florify.delivery.domain.model.DeliverySlot;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Интерактор управления временными слотами доставки.
 *
 * Правила:
 * - Слот уникален по дате + startTime + endTime (нет дублей).
 * - Удаление слота запрещено если есть активные задачи (currentLoad > 0).
 * - maxCapacity > 0 обязательно.
 * - startTime должен быть до endTime.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeliverySlotInteractor implements DeliverySlotUseCase {

    private final DeliverySlotRepository slotRepository;

    @Override
    @Transactional
    public DeliverySlot create(CreateDeliverySlotCommand command) {
        log.info("Creating delivery slot for date {} [{} - {}]",
                command.date(), command.startTime(), command.endTime());

        if (command.maxCapacity() <= 0) {
            throw new ConflictException("Slot maxCapacity must be greater than 0");
        }
        if (!command.startTime().isBefore(command.endTime())) {
            throw new ConflictException("Slot startTime must be before endTime");
        }
        if (slotRepository.existsByDateAndTime(command.date(), command.startTime(), command.endTime())) {
            throw new ConflictException("Delivery slot for this date and time already exists");
        }

        DeliverySlot slot = DeliverySlot.builder()
                .id(UUID.randomUUID())
                .date(command.date())
                .startTime(command.startTime())
                .endTime(command.endTime())
                .maxCapacity(command.maxCapacity())
                .currentLoad(0)
                .build();

        return slotRepository.save(slot);
    }

    @Override
    @Transactional
    public DeliverySlot update(UpdateDeliverySlotCommand command) {
        log.info("Updating delivery slot {}", command.slotId());

        DeliverySlot slot = slotRepository.findById(command.slotId())
                .orElseThrow(() -> new DeliverySlotNotFoundException(command.slotId()));

        if (command.maxCapacity() <= 0) {
            throw new ConflictException("Slot maxCapacity must be greater than 0");
        }
        if (!command.startTime().isBefore(command.endTime())) {
            throw new ConflictException("Slot startTime must be before endTime");
        }

        DeliverySlot updated = slot.toBuilder()
                .startTime(command.startTime())
                .endTime(command.endTime())
                .maxCapacity(command.maxCapacity())
                .build();

        return slotRepository.save(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliverySlot getById(UUID id) {
        return slotRepository.findById(id)
                .orElseThrow(() -> new DeliverySlotNotFoundException(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliverySlot> getByDate(LocalDate date) {
        return slotRepository.findByDate(date);
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID performerId) {
        log.info("Deleting delivery slot {} by performer {}", id, performerId);

        DeliverySlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new DeliverySlotNotFoundException(id));

        if (slot.getCurrentLoad() > 0) {
            throw new ConflictException(
                    "Cannot delete slot with active tasks (currentLoad=" + slot.getCurrentLoad() + ")");
        }

        slotRepository.deleteById(id);
    }
}
