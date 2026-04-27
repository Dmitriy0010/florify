package ru.florify.notification.adapter.out.email;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "smtp")
public class SmtpProperties {
    private String host;
    private int port;
    private String username;
    private String password;
    private String from;
}

