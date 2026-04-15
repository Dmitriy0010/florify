package ru.florify.auth.application.port.in;

import ru.florify.auth.domain.model.User;
import ru.florify.common.usecase.UseCase;

import java.util.UUID;

/**
 * Inbound port for getting current user information.
 */
public interface GetCurrentUserUseCase extends UseCase<UUID, User> {
}
