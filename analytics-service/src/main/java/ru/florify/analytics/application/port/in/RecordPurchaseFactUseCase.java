package ru.florify.analytics.application.port.in;

import ru.florify.analytics.application.command.RecordPurchaseFactCommand;

public interface RecordPurchaseFactUseCase {
    void record(RecordPurchaseFactCommand cmd);
}
