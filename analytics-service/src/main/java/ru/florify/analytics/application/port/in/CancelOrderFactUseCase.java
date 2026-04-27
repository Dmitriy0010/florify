package ru.florify.analytics.application.port.in;

import ru.florify.analytics.application.command.CancelOrderFactCommand;

public interface CancelOrderFactUseCase {
    void cancel(CancelOrderFactCommand cmd);
}
