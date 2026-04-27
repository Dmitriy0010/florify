package ru.florify.notification.domain.exception;

import ru.florify.common.exception.DomainException;

import java.util.UUID;

public class RecipientContactNotFoundException extends DomainException {
    public RecipientContactNotFoundException(UUID recipientId) {
        super("RECIPIENT_CONTACT_NOT_FOUND", "Recipient contact not found for recipientId=" + recipientId);
    }
}

