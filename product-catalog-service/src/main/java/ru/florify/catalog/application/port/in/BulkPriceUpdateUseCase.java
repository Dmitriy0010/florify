package ru.florify.catalog.application.port.in;

import ru.florify.catalog.application.command.BulkPriceUpdateCommand;

public interface BulkPriceUpdateUseCase {
    void execute(BulkPriceUpdateCommand command);
}
