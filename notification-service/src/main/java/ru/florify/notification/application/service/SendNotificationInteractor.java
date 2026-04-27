package ru.florify.notification.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.florify.notification.application.command.SendNotificationCommand;
import ru.florify.notification.application.port.in.SendNotificationUseCase;
import ru.florify.notification.application.port.out.*;
import ru.florify.notification.domain.exception.NotificationTemplateInactiveException;
import ru.florify.notification.domain.exception.NotificationTemplateNotFoundException;
import ru.florify.notification.domain.exception.RecipientContactNotFoundException;
import ru.florify.notification.domain.model.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SendNotificationInteractor implements SendNotificationUseCase {

    private final NotificationTemplateRepositoryPort templateRepository;
    private final NotificationLogRepositoryPort logRepository;
    private final NotificationSenderPort senderPort;
    private final TemplateRendererPort templateRendererPort;
    private final RecipientDirectoryPort recipientDirectoryPort;

    @Override
    public NotificationLog send(SendNotificationCommand command) {
        NotificationTemplate template = templateRepository
                .findByCodeAndChannel(command.templateCode(), command.channel())
                .orElseThrow(() -> new NotificationTemplateNotFoundException(command.templateCode()));

        if (!template.isActive()) {
            throw new NotificationTemplateInactiveException(template.getCode());
        }

        Map<String, Object> variables = command.variables() != null ? command.variables() : Map.of();

        String subject = template.getSubject() != null
                ? templateRendererPort.render(template.getSubject(), variables)
                : null;
        String body = templateRendererPort.render(template.getBodyTemplate(), variables);

        String contact = resolveRecipientContact(command.channel(), command.recipientId());

        NotificationLog logEntry = NotificationLog.builder()
                .id(UUID.randomUUID())
                .recipientId(command.recipientId())
                .recipientContact(contact)
                .channel(command.channel())
                .templateCode(template.getCode())
                .status(SendStatus.PENDING)
                .sentAt(null)
                .errorMessage(null)
                .build();

        NotificationLog saved = logRepository.save(logEntry);

        try {
            senderPort.send(command.channel(), contact, subject, body);
            NotificationLog sent = saved.markSent(Instant.now());
            return logRepository.save(sent);
        } catch (Exception e) {
            log.warn("Notification send failed: templateCode={}, channel={}, recipientId={}, error={}",
                    command.templateCode(), command.channel(), command.recipientId(), e.getMessage());
            NotificationLog failed = saved.markFailed(Instant.now(), e.getMessage());
            return logRepository.save(failed);
        }
    }

    private String resolveRecipientContact(Channel channel, UUID recipientId) {
        return switch (channel) {
            case EMAIL -> recipientDirectoryPort.getEmail(recipientId)
                    .orElseThrow(() -> new RecipientContactNotFoundException(recipientId));
            case TELEGRAM -> recipientDirectoryPort.getTelegramChatId(recipientId)
                    .orElseThrow(() -> new RecipientContactNotFoundException(recipientId));
        };
    }
}

