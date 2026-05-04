package ru.florify.notification.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.florify.notification.application.command.SendBlastCommand;
import ru.florify.notification.application.port.in.SendBlastUseCase;
import ru.florify.notification.application.port.out.*;
import ru.florify.notification.domain.model.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SendBlastInteractor implements SendBlastUseCase {

    private final NotificationTemplateRepositoryPort templateRepository;
    private final NotificationLogRepositoryPort logRepository;
    private final NotificationSenderPort senderPort;
    private final TemplateRendererPort templateRendererPort;
    private final RecipientDirectoryPort recipientDirectoryPort;

    @Override
    public BlastResult sendBlast(SendBlastCommand command) {
        log.info("Starting blast: channel={}, recipientsCount={}", command.channel(), command.recipientIds().size());

        int success = 0;
        int failure = 0;

        for (UUID recipientId : command.recipientIds()) {
            try {
                sendToRecipient(command, recipientId);
                success++;
            } catch (Exception e) {
                log.error("Failed to send blast item to recipient {}: {}", recipientId, e.getMessage());
                failure++;
            }
        }

        return new BlastResult(command.recipientIds().size(), success, failure);
    }

    private void sendToRecipient(SendBlastCommand command, UUID recipientId) {
        String subject;
        String body;
        String templateCode = command.templateCode();

        Map<String, Object> variables = command.variables() != null ? command.variables() : Map.of();

        if (templateCode != null && !templateCode.isBlank()) {
            NotificationTemplate template = templateRepository
                    .findByCodeAndChannel(templateCode, command.channel())
                    .orElseThrow(() -> new RuntimeException("Template not found: " + templateCode));

            if (!template.isActive()) {
                throw new RuntimeException("Template inactive: " + templateCode);
            }

            subject = template.getSubject() != null
                    ? templateRendererPort.render(template.getSubject(), variables)
                    : command.customSubject();
            body = templateRendererPort.render(template.getBodyTemplate(), variables);
        } else {
            subject = command.customSubject();
            body = command.customBody();
        }

        String contact = resolveRecipientContact(command.channel(), recipientId);

        NotificationLog logEntry = NotificationLog.builder()
                .id(UUID.randomUUID())
                .recipientId(recipientId)
                .recipientContact(contact)
                .channel(command.channel())
                .templateCode(templateCode != null ? templateCode : "CUSTOM")
                .status(SendStatus.PENDING)
                .sentAt(null)
                .errorMessage(null)
                .build();

        NotificationLog saved = logRepository.save(logEntry);

        try {
            senderPort.send(command.channel(), contact, subject, body);
            NotificationLog sent = saved.markSent(Instant.now());
            logRepository.save(sent);
        } catch (Exception e) {
            NotificationLog failed = saved.markFailed(Instant.now(), e.getMessage());
            logRepository.save(failed);
            throw e;
        }
    }

    private String resolveRecipientContact(Channel channel, UUID recipientId) {
        return switch (channel) {
            case EMAIL -> recipientDirectoryPort.getEmail(recipientId)
                    .orElseThrow(() -> new RuntimeException("Email not found for recipient " + recipientId));
            case TELEGRAM -> recipientDirectoryPort.getTelegramChatId(recipientId)
                    .orElseThrow(() -> new RuntimeException("Telegram ChatID not found for recipient " + recipientId));
        };
    }
}
