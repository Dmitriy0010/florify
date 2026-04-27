package ru.florify.auth.application.port.in;

import ru.florify.auth.application.AuthTokensResult;
import ru.florify.auth.application.command.RegisterUserCommand;
import ru.florify.common.usecase.UseCase;

/**
 * Use case for registering new users in the system.
 * Handles credential hashing, initial role assignment, and user profile creation.
 * Returns a set of JWT tokens (access and refresh) upon successful registration.
 */
public interface RegisterUserUseCase extends UseCase<RegisterUserCommand, AuthTokensResult> {
}
