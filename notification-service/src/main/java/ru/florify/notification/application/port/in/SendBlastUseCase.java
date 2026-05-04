package ru.florify.notification.application.port.in;

import ru.florify.notification.application.command.SendBlastCommand;

public interface SendBlastUseCase {
    BlastResult sendBlast(SendBlastCommand command);

    record BlastResult(int total, int success, int failure) {}
}
