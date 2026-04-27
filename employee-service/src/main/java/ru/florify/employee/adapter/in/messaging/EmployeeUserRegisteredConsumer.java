package ru.florify.employee.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.event.UserRegisteredEvent;
import ru.florify.employee.application.command.CreateEmployeeCommand;
import ru.florify.employee.application.port.in.EmployeeUseCase;
import ru.florify.employee.domain.model.EmployeeRole;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmployeeUserRegisteredConsumer {

    private final EmployeeUseCase employeeUseCase;

    @KafkaListener(topics = "auth.user.registered", groupId = "employee-service")
    @Transactional
    public void consume(UserRegisteredEvent event) {
        log.info("Received UserRegisteredEvent: userId={}, role={}", event.userId(), event.role());

        // Check if the role is relevant for employee-service
        EmployeeRole employeeRole = null;
        try {
            employeeRole = EmployeeRole.valueOf(event.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.debug("User role {} is not an employee role, skipping.", event.role());
            return;
        }

        CreateEmployeeCommand command = new CreateEmployeeCommand(
                event.userId(),
                null,                            // storeId not known yet
                extractFirstName(event.email()), // Placeholder for now
                "",                              // Placeholder for now
                event.phone(),
                employeeRole,
                LocalDate.ofInstant(event.occurredAt(), ZoneId.systemDefault()),
                null
        );

        try {
            employeeUseCase.create(command);
            log.info("Successfully created employee profile for userId={}", event.userId());
        } catch (Exception e) {
            log.error("Failed to create employee profile for userId={}: {}", event.userId(), e.getMessage());
        }
    }

    private String extractFirstName(String email) {
        if (email == null || !email.contains("@")) return "New";
        return email.split("@")[0];
    }
}
