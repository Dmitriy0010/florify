package ru.florify.customer.infrastructure.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.outbox.OutboxEvent;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.application.port.out.OutboxRepository;
import ru.florify.customer.domain.event.BirthdayAlertEvent;
import ru.florify.customer.domain.model.Customer;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class BirthdayAlertScheduler {

    private final CustomerRepository customerRepository;
    private final OutboxRepository outboxRepository;
    private final Clock clock;

    /**
     * Checks for customers having a birthday today and publishes alerts to the outbox.
     * Runs daily at 9:00 AM.
     */
    @Scheduled(cron = "${app.scheduler.birthday-check-cron:0 0 9 * * *}")
    @SchedulerLock(name = "birthdayAlertTask", lockAtMostFor = "PT10M", lockAtLeastFor = "PT1M")
    @Transactional
    public void checkBirthdays() {
        LocalDate tomorrow = LocalDate.now(clock).plusDays(1);
        int month = tomorrow.getMonthValue();
        int day = tomorrow.getDayOfMonth();

        log.info("Checking for birthdays on {}/{}", month, day);

        List<Customer> birthdayCustomers = customerRepository.findByBirthMonthAndDay(month, day);
        if (birthdayCustomers.isEmpty()) {
            log.info("No birthdays found today");
            return;
        }

        log.info("Found {} customers with birthday today", birthdayCustomers.size());

        Instant now = Instant.now(clock);
        for (Customer customer : birthdayCustomers) {
            BirthdayAlertEvent event = new BirthdayAlertEvent(
                UUID.randomUUID(),
                customer.getId(),
                customer.getPhone(),
                customer.getFirstName(),
                now
            );

            outboxRepository.save(OutboxEvent.create(
                "customers.birthday_alert",
                customer.getId().toString(),
                event,
                now,
                Collections.emptyMap()
            ));
        }
    }
}
