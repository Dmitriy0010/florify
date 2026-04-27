package ru.florify.analytics.application.port.in;

import ru.florify.analytics.application.command.RecordOrderFactCommand;

public interface RecordOrderFactUseCase {
    void record(RecordOrderFactCommand cmd);
}
