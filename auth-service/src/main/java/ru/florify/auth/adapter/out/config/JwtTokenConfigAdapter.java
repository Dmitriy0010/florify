package ru.florify.auth.adapter.out.config;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.auth.application.port.out.TokenConfigPort;
import ru.florify.common.security.JwtProperties;

/**
 * Adapter that maps JwtProperties to TokenConfigPort.
 */
@Component
@RequiredArgsConstructor
public class JwtTokenConfigAdapter implements TokenConfigPort {

    private final JwtProperties jwtProperties;

    @Override
    public long getRefreshTokenTtlDays() {
        return jwtProperties.getRefreshTokenTtlDays();
    }
}
