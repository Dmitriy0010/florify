package ru.florify.notification.application.port.out;

import java.util.Optional;
import java.util.UUID;

public interface RecipientDirectoryPort {
    Optional<String> getEmail(UUID recipientId);
    Optional<String> getTelegramChatId(UUID recipientId);
}

