package ru.florify.auth.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.auth.application.AuthTokensResult;
import ru.florify.auth.application.command.LoginUserCommand;
import ru.florify.auth.application.port.in.LoginUserUseCase;
import ru.florify.auth.application.port.out.PasswordHasher;
import ru.florify.auth.application.port.out.RefreshTokenRepository;
import ru.florify.auth.application.port.out.TokenConfigPort;
import ru.florify.auth.application.port.out.TokenGenerator;
import ru.florify.auth.application.port.out.UserRepository;
import ru.florify.auth.domain.exception.AuthCredentialsInvalidException;
import ru.florify.auth.domain.model.RefreshToken;
import ru.florify.auth.domain.model.User;
import ru.florify.common.exception.ForbiddenException;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

/**
 * Implementation of the login use case.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginUserInteractor implements LoginUserUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordHasher passwordHasher;
    private final TokenGenerator tokenGenerator;
    private final TokenConfigPort tokenConfigPort;
    private final Clock clock;

    @Override
    @Transactional
    public AuthTokensResult execute(LoginUserCommand command) {
        log.info("Attempting login for email: {}", command.email());

        Instant now = Instant.now(clock);

        User user = userRepository.findByEmail(command.email())
                .orElseThrow(AuthCredentialsInvalidException::new);

        if (!passwordHasher.matches(command.password(), user.passwordHash())) {
            throw new AuthCredentialsInvalidException();
        }

        if (!user.active()) {
            throw new ForbiddenException("Account is deactivated");
        }

        // Generate tokens upon successful login
        String accessToken = tokenGenerator.generateAccessToken(user);
        Instant accessTokenExpiresAt = tokenGenerator.getExpiration(accessToken);

        String rawRefreshToken = UUID.randomUUID().toString();
        String refreshTokenHash = passwordHasher.hash(rawRefreshToken);

        RefreshToken refreshTokenModel = RefreshToken.create(
                user.id(),
                refreshTokenHash,
                tokenConfigPort.getRefreshTokenTtlDays(),
                command.deviceInfo(),
                now
        );
        refreshTokenRepository.save(refreshTokenModel);

        return new AuthTokensResult(
                accessToken,
                rawRefreshToken,
                accessTokenExpiresAt,
                refreshTokenModel.getExpiresAt(),
                user.id(),
                user.roles()
        );
    }
}
