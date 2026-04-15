package ru.florify.catalog.application.port.in;

import ru.florify.catalog.application.command.DeactivateProductCommand;

public interface DeactivateProductUseCase {
    void execute(DeactivateProductCommand command);
}
