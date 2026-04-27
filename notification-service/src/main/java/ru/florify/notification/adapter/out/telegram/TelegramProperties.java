package ru.florify.notification.adapter.out.telegram;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "telegram")
public class TelegramProperties {
    private String apiBaseUrl;
    private String botToken;
}

