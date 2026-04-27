package ru.florify.notification.adapter.out.telegram;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import ru.florify.notification.application.port.out.NotificationSenderPort;
import ru.florify.notification.domain.model.Channel;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class TelegramNotificationSenderAdapter implements NotificationSenderPort {

    private final RestClient telegramRestClient;
    private final TelegramProperties properties;

    @Override
    public void send(Channel channel, String recipientContact, String subject, String body) {
        if (channel != Channel.TELEGRAM) {
            return;
        }

        String token = properties.getBotToken();
        if (token == null || token.isBlank()) {
            throw new IllegalStateException("Telegram botToken is not configured");
        }

        telegramRestClient.post()
                .uri("/bot{token}/sendMessage", token)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "chat_id", recipientContact,
                        "text", body != null ? body : ""
                ))
                .retrieve()
                .toBodilessEntity();
    }
}

