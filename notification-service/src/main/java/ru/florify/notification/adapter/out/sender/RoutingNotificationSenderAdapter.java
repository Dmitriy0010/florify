package ru.florify.notification.adapter.out.sender;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import ru.florify.notification.application.port.out.NotificationSenderPort;
import ru.florify.notification.domain.model.Channel;

import java.util.List;

@Component
@Primary
@RequiredArgsConstructor
public class RoutingNotificationSenderAdapter implements NotificationSenderPort {

    private final List<NotificationSenderPort> delegates;

    @Override
    public void send(Channel channel, String recipientContact, String subject, String body) {
        for (NotificationSenderPort delegate : delegates) {
            if (delegate == this) {
                continue;
            }
            delegate.send(channel, recipientContact, subject, body);
        }
    }
}

