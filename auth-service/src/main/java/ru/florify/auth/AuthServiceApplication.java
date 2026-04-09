package ru.florify.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import ru.florify.common.security.JwtProperties;

@SpringBootApplication(scanBasePackages = {"ru.florify.auth", "ru.florify.common"})
@EnableConfigurationProperties(JwtProperties.class)
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
