package ru.florify.customer.infrastructure.scheduler;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.event.ApplicationEvents;
import org.springframework.test.context.event.RecordApplicationEvents;
import ru.florify.customer.BaseIntegrationTest;
import ru.florify.customer.adapter.out.persistence.entity.CustomerJpaEntity;
import ru.florify.customer.adapter.out.persistence.repository.CustomerJpaRepository;
import ru.florify.common.event.BirthdayAlertEvent;
import ru.florify.customer.domain.enums.CustomerSource;

import java.time.Clock;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@RecordApplicationEvents
class BirthdayAlertSchedulerIT extends BaseIntegrationTest {

    @Autowired
    private BirthdayAlertScheduler scheduler;

    @Autowired
    private CustomerJpaRepository customerRepository;
    @Autowired
    private ApplicationEvents applicationEvents;
    @Autowired
    private Clock clock;

    @Test
    @DisplayName("Should find birthday customers and publish internal event")
    void shouldPublishBirthdayEvent() {
        // Given
        LocalDate today = LocalDate.now(clock);
        customerRepository.save(CustomerJpaEntity.builder()
                .id(UUID.randomUUID())
                .phone("+79222222222")
                .firstName("Birthday")
                .birthDate(today.plusDays(1).minusYears(25))
                .source(ru.florify.customer.domain.enums.CustomerSource.WEB)
                .active(true)
                .build());

        // When
        scheduler.checkBirthdays();

        // Then
        long count = applicationEvents.stream(BirthdayAlertEvent.class)
                .count();
        assertThat(count).isEqualTo(1);
    }
}

