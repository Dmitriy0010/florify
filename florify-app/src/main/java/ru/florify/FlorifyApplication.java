package ru.florify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication(scanBasePackages = "ru.florify")
@EnableScheduling
@EnableRetry
public class FlorifyApplication {

    public static void main(String[] args) {
        System.setProperty("user.timezone", "UTC");
        SpringApplication.run(FlorifyApplication.class, args);
    }
}
