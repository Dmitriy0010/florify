package ru.florify.auth.application.port.in;

import ru.florify.auth.application.command.ChangePasswordCommand;
import ru.florify.common.usecase.UseCase;

public interface ChangePasswordUseCase extends UseCase<ChangePasswordCommand, Void> {}
