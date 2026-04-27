package ru.florify.notification.application.port.out;

import ru.florify.notification.domain.model.Channel;

public interface NotificationSenderPort {
    void send(Channel channel, String recipientContact, String subject, String body);
}

