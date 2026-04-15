package ru.florify.auth.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.auth.application.command.LogoutCommand;
import ru.florify.auth.application.port.out.PasswordHasher;
import ru.florify.auth.application.port.out.RefreshTokenRepository;
import ru.florify.auth.domain.model.RefreshToken;

import ru.florify.auth.domain.model.Role;
import ru.florify.common.security.TokenBlacklist;
import ru.florify.auth.application.port.out.TokenGenerator;
import java.time.Duration;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LogoutInteractorTest {

    @Mock private TokenBlacklist tokenBlacklist;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordHasher passwordHasher;
    @Mock private TokenGenerator tokenGenerator;

    private LogoutInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new LogoutInteractor(tokenBlacklist, refreshTokenRepository, passwordHasher, tokenGenerator);
    }

    @Test
    @DisplayName("Should blacklist access token and revoke refresh token if present")
    void shouldLogoutSuccessfully() {
        UUID userId = UUID.randomUUID();
        var command = new LogoutCommand("access-token", "refresh-token", userId);
        RefreshToken token = RefreshToken.builder()
                .userId(userId)
                .revoked(false)
                .build();

        when(passwordHasher.hash("refresh-token")).thenReturn("hash");
        when(refreshTokenRepository.findByTokenHash("hash")).thenReturn(Optional.of(token));
        when(tokenGenerator.getRemainingTtl("access-token")).thenReturn(Duration.ofMinutes(10));

        interactor.execute(command);

        verify(tokenBlacklist).blacklist(eq("access-token"), any(Duration.class));
        verify(refreshTokenRepository).save(argThat(RefreshToken::isRevoked));
    }

    @Test
    @DisplayName("Should be idempotent when tokens already processed")
    void shouldBeIdempotent() {
        var command = new LogoutCommand(null, "none", UUID.randomUUID());
        when(passwordHasher.hash("none")).thenReturn("h");
        when(refreshTokenRepository.findByTokenHash("h")).thenReturn(Optional.empty());

        interactor.execute(command);

        verify(tokenBlacklist, never()).blacklist(any(), any());
        verify(refreshTokenRepository, never()).save(any());
    }
}
