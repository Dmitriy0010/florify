package ru.florify.delivery.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.exception.ConflictException;
import ru.florify.delivery.application.command.CreateDeliveryZoneCommand;
import ru.florify.delivery.application.command.UpdateDeliveryZoneCommand;
import ru.florify.delivery.application.port.in.DeliveryZoneUseCase;
import ru.florify.delivery.application.port.out.DeliveryZoneRepository;
import ru.florify.delivery.domain.exception.DeliveryZoneNotFoundException;
import ru.florify.delivery.domain.model.DeliveryZone;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Интерактор управления зонами доставки (CRUD).
 *
 * Правила:
 * - Имена зон уникальны (проверяется перед созданием).
 * - Деактивация — soft delete (данные истории сохраняются).
 * - Время создания устанавливается здесь, не в @PrePersist.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryZoneInteractor implements DeliveryZoneUseCase {

    private final DeliveryZoneRepository zoneRepository;
    private final Clock clock;

    @Override
    @Transactional
    public DeliveryZone create(CreateDeliveryZoneCommand command) {
        log.info("Creating delivery zone '{}'", command.name());

        if (zoneRepository.existsByName(command.name())) {
            throw new ConflictException("Delivery zone with name '" + command.name() + "' already exists");
        }

        DeliveryZone zone = DeliveryZone.builder()
                .id(UUID.randomUUID())
                .name(command.name())
                .polygon(command.polygon())
                .deliveryFee(command.deliveryFee())
                .minOrderAmount(command.minOrderAmount())
                .active(true)
                .createdAt(Instant.now(clock))
                .build();

        return zoneRepository.save(zone);
    }

    @Override
    @Transactional
    public DeliveryZone update(UpdateDeliveryZoneCommand command) {
        log.info("Updating delivery zone {}", command.zoneId());

        DeliveryZone zone = zoneRepository.findById(command.zoneId())
                .orElseThrow(() -> new DeliveryZoneNotFoundException(command.zoneId()));

        // Проверяем уникальность имени только если оно изменилось
        if (!zone.getName().equalsIgnoreCase(command.name()) && zoneRepository.existsByName(command.name())) {
            throw new ConflictException("Delivery zone with name '" + command.name() + "' already exists");
        }

        DeliveryZone updated = zone.toBuilder()
                .name(command.name())
                .polygon(command.polygon())
                .deliveryFee(command.deliveryFee())
                .minOrderAmount(command.minOrderAmount())
                .build();

        return zoneRepository.save(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryZone getById(UUID id) {
        return zoneRepository.findById(id)
                .orElseThrow(() -> new DeliveryZoneNotFoundException(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryZone> getAll() {
        return zoneRepository.findAllActive();
    }

    @Override
    @Transactional
    public void deactivate(UUID id, UUID performerId) {
        log.info("Deactivating delivery zone {} by performer {}", id, performerId);

        DeliveryZone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new DeliveryZoneNotFoundException(id));

        zoneRepository.save(zone.deactivate());
    }
}
