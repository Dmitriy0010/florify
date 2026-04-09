package ru.florify.auth.application.port.in;

import ru.florify.auth.application.command.LoginUserCommand;
import ru.florify.auth.domain.model.User;
import ru.florify.common.usecase.UseCase;

/**
 * Inbound port for user login.
 */
public interface LoginUserUseCase extends UseCase<LoginUserCommand, User> {
}
