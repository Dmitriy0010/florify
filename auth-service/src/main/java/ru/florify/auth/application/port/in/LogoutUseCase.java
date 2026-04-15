package ru.florify.auth.application.port.in;

import ru.florify.auth.application.command.LogoutCommand;
import ru.florify.common.usecase.UseCase;

/**
 * Inbound port for user logout.
 */
public interface LogoutUseCase extends UseCase<LogoutCommand, Void> {
}
