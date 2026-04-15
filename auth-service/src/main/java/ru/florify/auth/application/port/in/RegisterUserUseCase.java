package ru.florify.auth.application.port.in;

import ru.florify.auth.application.AuthTokensResult;
import ru.florify.auth.application.command.RegisterUserCommand;
import ru.florify.common.usecase.UseCase;

/**
 * Inbound port for user registration.
 */
public interface RegisterUserUseCase extends UseCase<RegisterUserCommand, AuthTokensResult> {
}
