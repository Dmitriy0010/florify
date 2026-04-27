package ru.florify.notification.adapter.out.directory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import ru.florify.notification.application.port.out.RecipientDirectoryPort;

import java.util.Optional;
import java.util.UUID;

@Component
public class RecipientDirectoryStubAdapter implements RecipientDirectoryPort {

    @Value("${notification.stub.email:}")
    private String stubEmail;

    @Value("${notification.stub.telegramChatId:}")
    private String stubTelegramChatId;

    @Override
    public Optional<String> getEmail(UUID recipientId) {
        return stubEmail == null || stubEmail.isBlank() ? Optional.empty() : Optional.of(stubEmail);
    }

    @Override
    public Optional<String> getTelegramChatId(UUID recipientId) {
        return stubTelegramChatId == null || stubTelegramChatId.isBlank()
                ? Optional.empty()
                : Optional.of(stubTelegramChatId);
    }
}

