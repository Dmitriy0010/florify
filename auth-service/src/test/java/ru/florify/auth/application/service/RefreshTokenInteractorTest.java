package ru.florify.auth.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.auth.application.AuthTokensResult;
import ru.florify.auth.application.command.RefreshTokenCommand;
import ru.florify.auth.application.port.out.PasswordHasher;
import ru.florify.auth.application.port.out.RefreshTokenRepository;
import ru.florify.auth.application.port.out.TokenConfigPort;
import ru.florify.auth.application.port.out.TokenGenerator;
import ru.florify.auth.application.port.out.UserRepository;
import ru.florify.auth.domain.model.RefreshToken;
import ru.florify.auth.domain.model.User;
import ru.florify.common.exception.TokenExpiredException;
import ru.florify.common.exception.TokenInvalidException;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenInteractorTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordHasher passwordHasher;
    @Mock private TokenGenerator tokenGenerator;
    @Mock private TokenConfigPort tokenConfigPort;
    @Mock private Clock clock;

    private RefreshTokenInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new RefreshTokenInteractor(
                refreshTokenRepository,
                userRepository,
                passwordHasher,
                tokenGenerator,
                tokenConfigPort,
                clock
        );

        var fixedNow = Instant.parse("2026-04-10T10:00:00Z");
        lenient().when(clock.instant()).thenReturn(fixedNow);
        lenient().when(clock.getZone()).thenReturn(ZoneId.of("UTC"));
    }

    @Test
    @DisplayName("Should refresh tokens when valid refresh token provided")
    void shouldRefreshSuccessfully() {
        String rawToken = "valid-refresh";
        String hashedToken = "hashed-refresh";
        UUID userId = UUID.randomUUID();

        RefreshToken oldToken = RefreshToken.builder()
                .userId(userId)
                .tokenHash(hashedToken)
                .expiresAt(Instant.parse("2026-04-10T11:00:00Z")) // In the future
                .revoked(false)
                .build();
        User user = User.builder().id(userId).active(true).build();

        when(passwordHasher.hash(rawToken)).thenReturn(hashedToken);
        when(refreshTokenRepository.findByTokenHash(hashedToken)).thenReturn(Optional.of(oldToken));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(tokenGenerator.generateAccessToken(any())).thenReturn("new-access");
        when(tokenConfigPort.getRefreshTokenTtlDays()).thenReturn(30L);

        AuthTokensResult result = interactor.execute(new RefreshTokenCommand(rawToken, "dev"));

        assertNotNull(result);
        assertEquals("new-access", result.accessToken());
        verify(refreshTokenRepository).save(argThat(RefreshToken::isRevoked)); // Old token revoked
        verify(refreshTokenRepository, times(2)).save(any()); // Save old (revoked) and new
    }

    @Test
    @DisplayName("Should throw TokenExpiredException when token expired")
    void shouldThrowWhenExpired() {
        String rawToken = "expired";
        RefreshToken expiredToken = RefreshToken.builder()
                .expiresAt(Instant.parse("2026-04-10T09:00:00Z")) // In the past relative to 10:00:00
                .revoked(false)
                .build();

        when(passwordHasher.hash(rawToken)).thenReturn("hash");
        when(refreshTokenRepository.findByTokenHash("hash")).thenReturn(Optional.of(expiredToken));

        assertThrows(TokenExpiredException.class, () -> interactor.execute(new RefreshTokenCommand(rawToken, "dev")));
    }

    @Test
    @DisplayName("Should throw TokenInvalidException when token revoked")
    void shouldThrowWhenRevoked() {
        String rawToken = "revoked";
        RefreshToken revokedToken = RefreshToken.builder()
                .expiresAt(Instant.parse("2026-04-10T11:00:00Z")) // In the future
                .revoked(true)
                .build();

        when(passwordHasher.hash(rawToken)).thenReturn("hash");
        when(refreshTokenRepository.findByTokenHash("hash")).thenReturn(Optional.of(revokedToken));

        assertThrows(TokenInvalidException.class, () -> interactor.execute(new RefreshTokenCommand(rawToken, "dev")));
    }
}
