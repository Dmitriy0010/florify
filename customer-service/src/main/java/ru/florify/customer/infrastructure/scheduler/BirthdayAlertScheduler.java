package ru.florify.customer.infrastructure.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.common.event.BirthdayAlertEvent;
import ru.florify.customer.domain.model.Customer;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class BirthdayAlertScheduler {

    private final CustomerRepository customerRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    /**
     * Checks for customers having a birthday today and publishes alerts.
     * Consumed by internal listeners within the Modular Monolith.
     */
    @Scheduled(cron = "${app.scheduler.birthday-check-cron:0 0 9 * * *}")
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
                customer.getId(),
                customer.getPhone(),
                customer.getFirstName(),
                now
            );

            eventPublisher.publishEvent(event);
        }
    }
}
