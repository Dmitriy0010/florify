package ru.florify.common.test;

import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import ru.florify.common.security.JwtProperties;
import ru.florify.common.security.TokenBlacklist;
import ru.florify.common.security.UserProvider;

@TestConfiguration
public class SecurityMockConfig {

    @Bean
    public JwtProperties jwtProperties() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret("test-secret-key-test-secret-key-1234");
        properties.setIssuer("florify-test");
        properties.setAccessTokenTtlMinutes(60);
        properties.setRefreshTokenTtlDays(7);
        return properties;
    }

    @Bean
    public TokenBlacklist tokenBlacklist() {
        return Mockito.mock(TokenBlacklist.class);
    }

    @Bean
    public UserProvider userProvider() {
        return Mockito.mock(UserProvider.class);
    }
}
