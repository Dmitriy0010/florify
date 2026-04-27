package ru.florify.notification.application.service;

import org.junit.jupiter.api.Test;
import ru.florify.notification.application.command.SendNotificationCommand;
import ru.florify.notification.application.port.out.*;
import ru.florify.notification.domain.exception.RecipientContactNotFoundException;
import ru.florify.notification.domain.model.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SendNotificationInteractorTest {

    @Test
    void send_whenSuccessful_shouldReturnSentLog() {
        var templateRepo = mock(NotificationTemplateRepositoryPort.class);
        var logRepo = mock(NotificationLogRepositoryPort.class);
        var sender = mock(NotificationSenderPort.class);
        var renderer = mock(TemplateRendererPort.class);
        var directory = mock(RecipientDirectoryPort.class);

        UUID recipientId = UUID.randomUUID();

        when(templateRepo.findByCodeAndChannel("ORDER_CREATED", Channel.EMAIL))
                .thenReturn(Optional.of(NotificationTemplate.builder()
                        .id(UUID.randomUUID())
                        .code("ORDER_CREATED")
                        .channel(Channel.EMAIL)
                        .subject("Subj {{x}}")
                        .bodyTemplate("Body {{x}}")
                        .isActive(true)
                        .build()));

        when(renderer.render(anyString(), anyMap())).thenAnswer(inv -> inv.getArgument(0, String.class));
        when(directory.getEmail(recipientId)).thenReturn(Optional.of("a@b.com"));
        when(logRepo.save(any(NotificationLog.class))).thenAnswer(inv -> inv.getArgument(0, NotificationLog.class));

        SendNotificationInteractor interactor = new SendNotificationInteractor(
                templateRepo, logRepo, sender, renderer, directory
        );

        NotificationLog result = interactor.send(new SendNotificationCommand(
                "ORDER_CREATED",
                Channel.EMAIL,
                recipientId,
                Map.of("x", "1"),
                "corr"
        ));

        assertThat(result.getStatus()).isEqualTo(SendStatus.SENT);
        verify(sender).send(eq(Channel.EMAIL), eq("a@b.com"), anyString(), anyString());
    }

    @Test
    void send_whenNoContact_shouldThrow() {
        var templateRepo = mock(NotificationTemplateRepositoryPort.class);
        var logRepo = mock(NotificationLogRepositoryPort.class);
        var sender = mock(NotificationSenderPort.class);
        var renderer = mock(TemplateRendererPort.class);
        var directory = mock(RecipientDirectoryPort.class);

        UUID recipientId = UUID.randomUUID();

        when(templateRepo.findByCodeAndChannel("LOW_STOCK", Channel.TELEGRAM))
                .thenReturn(Optional.of(NotificationTemplate.builder()
                        .id(UUID.randomUUID())
                        .code("LOW_STOCK")
                        .channel(Channel.TELEGRAM)
                        .subject(null)
                        .bodyTemplate("x")
                        .isActive(true)
                        .build()));

        when(renderer.render(anyString(), anyMap())).thenReturn("x");
        when(directory.getTelegramChatId(recipientId)).thenReturn(Optional.empty());

        SendNotificationInteractor interactor = new SendNotificationInteractor(
                templateRepo, logRepo, sender, renderer, directory
        );

        assertThatThrownBy(() -> interactor.send(new SendNotificationCommand(
                "LOW_STOCK",
                Channel.TELEGRAM,
                recipientId,
                Map.of(),
                null
        ))).isInstanceOf(RecipientContactNotFoundException.class);
    }
}

