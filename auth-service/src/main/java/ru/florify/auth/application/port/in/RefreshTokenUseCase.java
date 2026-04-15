package ru.florify.auth.application.port.in;

import ru.florify.auth.application.AuthTokensResult;
import ru.florify.auth.application.command.RefreshTokenCommand;
import ru.florify.common.usecase.UseCase;

/**
 * Inbound port for refreshing authentication tokens.
 */
public interface RefreshTokenUseCase extends UseCase<RefreshTokenCommand, AuthTokensResult> {
}
