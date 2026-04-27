package ru.florify.notification.application.port.in;

import ru.florify.notification.application.command.SendNotificationCommand;
import ru.florify.notification.domain.model.NotificationLog;

public interface SendNotificationUseCase {
    NotificationLog send(SendNotificationCommand command);
}

