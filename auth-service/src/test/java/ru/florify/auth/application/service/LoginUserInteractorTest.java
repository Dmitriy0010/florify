package ru.florify.auth.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.auth.application.AuthTokensResult;
import ru.florify.auth.application.command.LoginUserCommand;
import ru.florify.auth.application.port.out.PasswordHasher;
import ru.florify.auth.application.port.out.RefreshTokenRepository;
import ru.florify.auth.application.port.out.TokenConfigPort;
import ru.florify.auth.application.port.out.TokenGenerator;
import ru.florify.auth.application.port.out.UserRepository;
import ru.florify.auth.domain.exception.AuthCredentialsInvalidException;
import ru.florify.auth.domain.model.User;
import ru.florify.common.exception.ForbiddenException;
import ru.florify.common.exception.NotFoundException;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoginUserInteractorTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordHasher passwordHasher;
    @Mock private TokenGenerator tokenGenerator;
    @Mock private TokenConfigPort tokenConfigPort;
    @Mock private Clock clock;

    private LoginUserInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new LoginUserInteractor(
                userRepository,
                refreshTokenRepository,
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
    @DisplayName("Should login successfully with correct credentials")
    void shouldLoginSuccessfully() {
        var command = new LoginUserCommand("test@email.com", "pass", "dev");
        User user = User.builder()
                .id(UUID.randomUUID())
                .passwordHash("hashed")
                .active(true)
                .build();

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordHasher.matches("pass", "hashed")).thenReturn(true);
        when(tokenGenerator.generateAccessToken(any())).thenReturn("token");
        when(tokenConfigPort.getRefreshTokenTtlDays()).thenReturn(30L);

        AuthTokensResult result = interactor.execute(command);

        assertNotNull(result);
        assertEquals("token", result.accessToken());
        verify(refreshTokenRepository).save(any());
    }

    @Test
    @DisplayName("Should throw AuthCredentialsInvalidException for wrong password")
    void shouldThrowWhenPasswordWrong() {
        var command = new LoginUserCommand("test@email.com", "wrong", "dev");
        User user = User.builder().passwordHash("hashed").active(true).build();

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordHasher.matches("wrong", "hashed")).thenReturn(false);

        assertThrows(AuthCredentialsInvalidException.class, () -> interactor.execute(command));
    }

    @Test
    @DisplayName("Should throw ForbiddenException when user is inactive")
    void shouldThrowWhenInactive() {
        var command = new LoginUserCommand("test@email.com", "pass", "dev");
        User user = User.builder().passwordHash("hashed").active(false).build();

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordHasher.matches("pass", "hashed")).thenReturn(true);

        assertThrows(ForbiddenException.class, () -> interactor.execute(command));
    }
}
