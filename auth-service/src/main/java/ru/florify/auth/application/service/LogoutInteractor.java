package ru.florify.auth.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.auth.application.command.LogoutCommand;
import ru.florify.auth.application.port.in.LogoutUseCase;
import ru.florify.auth.application.port.out.PasswordHasher;
import ru.florify.auth.application.port.out.RefreshTokenRepository;
import ru.florify.common.security.TokenBlacklist;
import ru.florify.auth.application.port.out.TokenGenerator;

import java.time.Duration;

/**
 * Interactor for user logout.
 * Adds the access token to the blacklist and revokes the refresh token.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LogoutInteractor implements LogoutUseCase {

    private final TokenBlacklist tokenBlacklist;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordHasher passwordHasher;
    private final TokenGenerator tokenGenerator;

    @Override
    @Transactional
    public Void execute(LogoutCommand command) {
        log.info("Processing logout for user: {}", command.userId());

        // 1. Blacklist the access token
        if (command.accessToken() != null) {
            Duration remainingTtl = tokenGenerator.getRemainingTtl(command.accessToken());
            if (!remainingTtl.isZero()) {
                tokenBlacklist.blacklist(command.accessToken(), remainingTtl);
                log.debug("Access token blacklisted for user: {}", command.userId());
            }
        }

        // 2. Revoke the refresh token (if hash matches)
        String refreshTokenHash = passwordHasher.hash(command.refreshToken());
        refreshTokenRepository.findByTokenHash(refreshTokenHash)
                .ifPresent(token -> {
                    if (token.getUserId().equals(command.userId())) {
                        refreshTokenRepository.save(token.revoke());
                        log.debug("Refresh token revoked for user: {}", command.userId());
                    }
                });

        return null;
    }
}
