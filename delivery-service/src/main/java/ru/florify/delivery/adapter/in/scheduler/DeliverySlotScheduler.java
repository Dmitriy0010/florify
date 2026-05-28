package ru.florify.delivery.adapter.in.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.delivery.adapter.out.persistence.entity.DeliverySlotJpaEntity;
import ru.florify.delivery.adapter.out.persistence.repository.DeliverySlotJpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Планировщик автоматической генерации временных слотов доставки.
 *
 * Запускается:
 *  - при старте приложения (initialDelay = 10 секунд после запуска)
 *  - каждую ночь в 01:00 (cron = "0 0 1 * * *")
 *
 * Генерирует слоты на DAYS_AHEAD дней вперёд.
 * Безопасен для повторного запуска — дубли пропускаются через existsByDateAndStartTimeAndEndTime.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DeliverySlotScheduler {

    /** Количество дней вперёд для генерации слотов */
    private static final int DAYS_AHEAD = 14;

    /** Временны́е окна доставки (начало каждого 2-часового слота) */
    private static final List<LocalTime> SLOT_STARTS = List.of(
            LocalTime.of(9, 0),
            LocalTime.of(11, 0),
            LocalTime.of(13, 0),
            LocalTime.of(15, 0),
            LocalTime.of(17, 0)
    );

    /** Вместимость каждого слота (заказов) */
    private static final int SLOT_CAPACITY = 10;

    private final DeliverySlotJpaRepository slotRepository;

    /**
     * Запускается при старте приложения (через 10 сек) и каждую ночь в 01:00.
     */
    @Scheduled(initialDelayString = "PT10S", fixedDelayString = "PT24H")
    @Transactional
    public void generateUpcomingSlots() {
        LocalDate today = LocalDate.now();
        log.info("[DeliverySlotScheduler] Generating delivery slots from {} for {} days ahead", today, DAYS_AHEAD);

        List<DeliverySlotJpaEntity> toSave = new ArrayList<>();

        for (int dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset++) {
            LocalDate date = today.plusDays(dayOffset);
            for (LocalTime start : SLOT_STARTS) {
                LocalTime end = start.plusHours(2);
                if (!slotRepository.existsByDateAndStartTimeAndEndTime(date, start, end)) {
                    toSave.add(DeliverySlotJpaEntity.builder()
                            .id(UUID.randomUUID())
                            .date(date)
                            .startTime(start)
                            .endTime(end)
                            .maxCapacity(SLOT_CAPACITY)
                            .currentLoad(0)
                            .build());
                }
            }
        }

        if (!toSave.isEmpty()) {
            slotRepository.saveAll(toSave);
            log.info("[DeliverySlotScheduler] Created {} new delivery slots", toSave.size());
        } else {
            log.debug("[DeliverySlotScheduler] All slots for the next {} days already exist", DAYS_AHEAD);
        }
    }
}
