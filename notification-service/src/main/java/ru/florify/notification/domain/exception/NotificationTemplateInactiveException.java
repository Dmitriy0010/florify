package ru.florify.notification.domain.exception;

import ru.florify.common.exception.DomainException;

public class NotificationTemplateInactiveException extends DomainException {
    public NotificationTemplateInactiveException(String code) {
        super("NOTIFICATION_TEMPLATE_INACTIVE", "Notification template is inactive: " + code);
    }
}

