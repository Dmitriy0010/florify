package ru.florify.analytics.application.port.in;

import ru.florify.analytics.application.command.RecordSalaryFactCommand;

public interface RecordSalaryFactUseCase {
    void record(RecordSalaryFactCommand cmd);
}
