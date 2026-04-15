package ru.florify.auth.application.port.in;

import ru.florify.auth.application.command.AssignRoleCommand;
import ru.florify.auth.domain.model.User;
import ru.florify.common.usecase.UseCase;

/**
 * Inbound port for assigning roles to users.
 */
public interface AssignRoleUseCase extends UseCase<AssignRoleCommand, User> {
}
