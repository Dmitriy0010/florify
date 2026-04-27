package ru.florify.analytics.application.port.in;

import ru.florify.analytics.application.command.RecordWriteoffFactCommand;

public interface RecordWriteoffFactUseCase {
    void record(RecordWriteoffFactCommand cmd);
}
