package ru.florify.auth.application.port.in;

import ru.florify.auth.application.command.RegisterUserCommand;
import ru.florify.auth.domain.model.User;
import ru.florify.common.usecase.UseCase;

/**
 * Inbound port for user registration.
 */
public interface RegisterUserUseCase extends UseCase<RegisterUserCommand, User> {
}
