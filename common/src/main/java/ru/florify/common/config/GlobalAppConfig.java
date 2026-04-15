package ru.florify.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

/**
 * Global application configuration for basic beans used across all modules.
 */
@Configuration
public class GlobalAppConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
