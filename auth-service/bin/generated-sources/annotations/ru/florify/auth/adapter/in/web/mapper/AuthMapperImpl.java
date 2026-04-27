package ru.florify.auth.adapter.in.web.mapper;

import java.time.Instant;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.auth.adapter.in.web.dto.TokenResponse;
import ru.florify.auth.application.AuthTokensResult;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-27T12:25:52+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class AuthMapperImpl implements AuthMapper {

    @Override
    public TokenResponse toResponse(AuthTokensResult result) {
        if ( result == null ) {
            return null;
        }

        String accessToken = null;
        String refreshToken = null;
        Instant accessTokenExpiresAt = null;
        Instant refreshTokenExpiresAt = null;

        accessToken = result.accessToken();
        refreshToken = result.refreshToken();
        accessTokenExpiresAt = result.accessTokenExpiresAt();
        refreshTokenExpiresAt = result.refreshTokenExpiresAt();

        TokenResponse tokenResponse = new TokenResponse( accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt );

        return tokenResponse;
    }
}
