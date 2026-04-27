package ru.florify.notification.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import ru.florify.notification.application.command.SendNotificationCommand;
import ru.florify.notification.application.port.in.SendNotificationUseCase;
import ru.florify.notification.domain.model.Channel;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventsConsumer {

    private final SendNotificationUseCase sendNotificationUseCase;
    private final KafkaPayloadMapper payloadMapper;

    @KafkaListener(topics = "${kafka.topics.orderStatusChanged:orders.order.status_changed}")
    public void onOrderStatusChanged(String payload) {
        Map<String, Object> data = payloadMapper.asMap(payload);
        UUID recipientId = UUID.fromString(String.valueOf(data.get("recipientId")));

        sendNotificationUseCase.send(new SendNotificationCommand(
                "ORDER_STATUS_CHANGED",
                Channel.TELEGRAM,
                recipientId,
                data,
                null
        ));
    }

    @KafkaListener(topics = "${kafka.topics.orderCreated:orders.order.created}")
    public void onOrderCreated(String payload) {
        Map<String, Object> data = payloadMapper.asMap(payload);
        UUID recipientId = UUID.fromString(String.valueOf(data.get("recipientId")));

        sendNotificationUseCase.send(new SendNotificationCommand(
                "ORDER_CREATED",
                Channel.EMAIL,
                recipientId,
                data,
                null
        ));
    }
}

