package ru.florify.notification.adapter.out.telegram;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(TelegramProperties.class)
public class TelegramConfig {

    @Bean
    public RestClient telegramRestClient(TelegramProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.getApiBaseUrl())
                .build();
    }
}

