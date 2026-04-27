package ru.florify.notification.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import ru.florify.notification.application.command.SendNotificationCommand;
import ru.florify.notification.application.port.in.SendNotificationUseCase;
import ru.florify.notification.domain.model.Channel;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EmployeeEventsConsumer {

    private final SendNotificationUseCase sendNotificationUseCase;
    private final KafkaPayloadMapper payloadMapper;

    @KafkaListener(topics = "${kafka.topics.salaryApproved:salary.approved}")
    public void onSalaryApproved(String payload) {
        Map<String, Object> data = payloadMapper.asMap(payload);
        UUID recipientId = UUID.fromString(String.valueOf(data.get("recipientId")));
        sendNotificationUseCase.send(new SendNotificationCommand(
                "SALARY_APPROVED",
                Channel.TELEGRAM,
                recipientId,
                data,
                null
        ));
    }
}

