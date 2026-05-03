package ru.florify.auth.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.auth.application.AuthTokensResult;
import ru.florify.auth.application.command.RegisterUserCommand;
import ru.florify.auth.application.port.out.AuthEventPublisher;
import ru.florify.auth.application.port.out.PasswordHasher;
import ru.florify.auth.application.port.out.RefreshTokenRepository;
import ru.florify.auth.application.port.out.TokenConfigPort;
import ru.florify.auth.application.port.out.TokenGenerator;
import ru.florify.auth.application.port.out.UserRepository;
import ru.florify.common.event.UserRegisteredEvent;
import ru.florify.auth.domain.model.Role;
import ru.florify.auth.domain.model.User;
import ru.florify.common.exception.ConflictException;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegisterUserInteractorTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordHasher passwordHasher;
    @Mock private TokenGenerator tokenGenerator;
    @Mock private AuthEventPublisher AuthEventPublisher;
    @Mock private TokenConfigPort tokenConfigPort;
    @Mock private Clock clock;

    private RegisterUserInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new RegisterUserInteractor(
                userRepository,
                refreshTokenRepository,
                passwordHasher,
                tokenGenerator,
                AuthEventPublisher,
                tokenConfigPort,
                clock
        );

        var fixedNow = Instant.parse("2026-04-10T10:00:00Z");
        lenient().when(clock.instant()).thenReturn(fixedNow);
        lenient().when(clock.getZone()).thenReturn(ZoneId.of("UTC"));
    }

    @Test
    @DisplayName("Should successfully register user, save tokens and publish event")
    void shouldRegisterSuccessfully() {
        // Given
        var command = new RegisterUserCommand("test@email.com", "pass123", "123", "F", "L", "dev", "CUSTOMER");
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordHasher.hash("pass123")).thenReturn("hashedPass");
        when(userRepository.save(any())).thenAnswer(I -> I.getArgument(0));
        when(tokenGenerator.generateAccessToken(any())).thenReturn("access-token");
        when(tokenConfigPort.getRefreshTokenTtlDays()).thenReturn(30L);

        // When
        AuthTokensResult result = interactor.execute(command);

        // Then
        assertNotNull(result);
        assertEquals("access-token", result.accessToken());
        verify(userRepository).save(any(User.class));
        verify(refreshTokenRepository).save(any());
        verify(AuthEventPublisher).publish(any(UserRegisteredEvent.class));
    }

    @Test
    @DisplayName("Should throw ConflictException when email exists")
    void shouldThrowConflictWhenEmailExists() {
        var command = new RegisterUserCommand("taken@email.com", "pass", null, "F", "L", "dev", "CUSTOMER");
        when(userRepository.existsByEmail("taken@email.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> interactor.execute(command));
        verify(userRepository, never()).save(any());
    }
}
