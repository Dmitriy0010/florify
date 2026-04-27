package ru.florify.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

import java.time.Clock;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * Global application configuration for basic beans used across all modules.
 */
@Configuration
@EnableAsync
public class GlobalAppConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }

    @Bean(name = "analyticsAsyncExecutor")
    public Executor analyticsAsyncExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}
