package ru.florify.auth.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.auth.application.AuthTokensResult;
import ru.florify.auth.application.command.RegisterUserCommand;
import ru.florify.auth.application.port.in.RegisterUserUseCase;
import ru.florify.auth.application.port.out.AuthEventPublisher;
import ru.florify.auth.application.port.out.PasswordHasher;
import ru.florify.auth.application.port.out.RefreshTokenRepository;
import ru.florify.auth.application.port.out.TokenConfigPort;
import ru.florify.auth.application.port.out.TokenGenerator;
import ru.florify.auth.application.port.out.UserRepository;
import ru.florify.common.event.UserRegisteredEvent;
import ru.florify.auth.domain.model.RefreshToken;
import ru.florify.auth.domain.model.Role;
import ru.florify.auth.domain.model.User;
import ru.florify.common.exception.ConflictException;

import java.time.Clock;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

/**
 * Implementation of the registration use case.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RegisterUserInteractor implements RegisterUserUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordHasher passwordHasher;
    private final TokenGenerator tokenGenerator;
    private final AuthEventPublisher AuthEventPublisher;
    private final TokenConfigPort tokenConfigPort;
    private final Clock clock;

    @Override
    @Transactional
    @Retryable(maxAttempts = 3, retryFor = ObjectOptimisticLockingFailureException.class)
    public AuthTokensResult execute(RegisterUserCommand command) {
        log.info("Registering new user with email: {}", command.email());

        Instant now = Instant.now(clock);

        if (userRepository.existsByEmail(command.email())) {
            throw new ConflictException("Email already taken: " + command.email());
        }

        if (command.phone() != null && userRepository.existsByPhone(command.phone())) {
            throw new ConflictException("Phone number already taken: " + command.phone());
        }

        String hashedPassword = passwordHasher.hash(command.password());

        Role userRole = Role.CUSTOMER;
        if (command.role() != null) {
            try {
                userRole = Role.valueOf(command.role().toUpperCase());
            } catch (Exception e) {
                log.warn("Invalid role provided: {}. Defaulting to CUSTOMER", command.role());
            }
        }

        User newUser = User.builder()
                .id(UUID.randomUUID())
                .email(command.email())
                .phone(command.phone())
                .firstName(command.firstName())
                .lastName(command.lastName())
                .passwordHash(hashedPassword)
                .roles(Set.of(userRole))
                .active(true)
                .createdAt(now)
                .build();

        User savedUser = userRepository.save(newUser);
        log.debug("User saved with ID: {}", savedUser.id());

        // 1. Generate Access Token
        String accessToken = tokenGenerator.generateAccessToken(savedUser);
        Instant accessTokenExpiresAt = tokenGenerator.getExpiration(accessToken);

        // 2. Generate Refresh Token
        String rawRefreshToken = UUID.randomUUID().toString();
        String refreshTokenHash = passwordHasher.hash(rawRefreshToken);
        
        // Checklist says 30 days
        RefreshToken refreshTokenModel = RefreshToken.create(
                savedUser.id(), 
                refreshTokenHash, 
                tokenConfigPort.getRefreshTokenTtlDays(), 
                command.deviceInfo(),
                now
        );
        refreshTokenRepository.save(refreshTokenModel);

        // 3. Publish Event
        AuthEventPublisher.publish(UserRegisteredEvent.of(savedUser.id(), savedUser.email(), command.phone(), userRole.name(), now));

        return new AuthTokensResult(
                accessToken,
                rawRefreshToken,
                accessTokenExpiresAt,
                refreshTokenModel.getExpiresAt(),
                savedUser.id(),
                savedUser.roles()
        );
    }
}
