package ru.florify.employee.adapter.out.messaging;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import ru.florify.common.event.SalaryPaidEvent;
import ru.florify.employee.application.port.out.SalaryPaidEventPublisher;
import ru.florify.employee.domain.model.SalaryStatement;

@Component
@RequiredArgsConstructor
public class KafkaSalaryPaidEventPublisher implements SalaryPaidEventPublisher {

    private static final String TOPIC = "employees.salary.paid";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publish(SalaryStatement statement) {
        SalaryPaidEvent event = new SalaryPaidEvent(
                statement.getId(),
                statement.getEmployeeId(),
                statement.getStoreId(),
                statement.getPeriod(),
                statement.getTotalPayout(),
                statement.getPaidAt()
        );
        kafkaTemplate.send(TOPIC, statement.getEmployeeId().toString(), event).join();
    }
}
