package ru.florify.analytics.application.port.in;

import ru.florify.analytics.application.command.ApplyCogsToOrderFactCommand;

public interface ApplyCogsToOrderFactUseCase {
    void apply(ApplyCogsToOrderFactCommand cmd);
}
