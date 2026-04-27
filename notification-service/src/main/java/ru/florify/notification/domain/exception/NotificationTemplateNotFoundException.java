package ru.florify.notification.domain.exception;

import ru.florify.common.exception.NotFoundException;

public class NotificationTemplateNotFoundException extends NotFoundException {
    public NotificationTemplateNotFoundException(String code) {
        super("Notification template", code);
    }
}

