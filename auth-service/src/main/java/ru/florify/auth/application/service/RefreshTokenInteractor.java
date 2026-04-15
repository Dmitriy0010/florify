package ru.florify.auth.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.auth.application.AuthTokensResult;
import ru.florify.auth.application.command.RefreshTokenCommand;
import ru.florify.auth.application.port.in.RefreshTokenUseCase;
import ru.florify.auth.application.port.out.PasswordHasher;
import ru.florify.auth.application.port.out.RefreshTokenRepository;
import ru.florify.auth.application.port.out.TokenConfigPort;
import ru.florify.auth.application.port.out.TokenGenerator;
import ru.florify.auth.application.port.out.UserRepository;
import ru.florify.auth.domain.model.RefreshToken;
import ru.florify.auth.domain.model.User;
import ru.florify.common.exception.TokenExpiredException;
import ru.florify.common.exception.TokenInvalidException;
import ru.florify.common.exception.NotFoundException;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

/**
 * Interactor for refreshing authentication tokens.
 * Implements token rotation: revokes the used token and issues a new pair.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenInteractor implements RefreshTokenUseCase {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final TokenGenerator tokenGenerator;
    private final TokenConfigPort tokenConfigPort;
    private final Clock clock;

    @Override
    @Transactional
    public AuthTokensResult execute(RefreshTokenCommand command) {
        log.info("Attempting to refresh tokens");

        Instant now = Instant.now(clock);

        String tokenHash = passwordHasher.hash(command.refreshToken());

        RefreshToken oldToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(TokenInvalidException::new);

        if (oldToken.isRevoked()) {
            log.warn("Attempted refresh with revoked token for user: {}", oldToken.getUserId());
            throw new TokenInvalidException();
        }

        if (oldToken.isExpired(now)) {
            log.warn("Attempted refresh with expired token for user: {}", oldToken.getUserId());
            throw new TokenExpiredException();
        }

        User user = userRepository.findById(oldToken.getUserId())
                .orElseThrow(() -> new NotFoundException("User", oldToken.getUserId()));

        // Revoke the old token (rotation)
        refreshTokenRepository.save(oldToken.revoke());

        // Generate new pair
        String accessToken = tokenGenerator.generateAccessToken(user);
        Instant accessTokenExpiresAt = tokenGenerator.getExpiration(accessToken);

        String newRawRefreshToken = UUID.randomUUID().toString();
        String newRefreshTokenHash = passwordHasher.hash(newRawRefreshToken);

        RefreshToken newToken = RefreshToken.create(
                user.id(),
                newRefreshTokenHash,
                tokenConfigPort.getRefreshTokenTtlDays(),
                command.deviceInfo(),
                now
        );
        refreshTokenRepository.save(newToken);

        log.debug("Tokens rotated successfully for user: {}", user.id());

        return new AuthTokensResult(
                accessToken,
                newRawRefreshToken,
                accessTokenExpiresAt,
                newToken.getExpiresAt(),
                user.id(),
                user.roles()
        );
    }
}
