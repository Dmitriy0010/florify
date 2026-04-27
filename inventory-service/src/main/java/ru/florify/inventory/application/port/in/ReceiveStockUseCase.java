package ru.florify.inventory.application.port.in;

import ru.florify.common.usecase.VoidUseCase;
import ru.florify.inventory.application.command.ReceiveStockCommand;

/**
 * Use case for receiving new stock batches from suppliers.
 * Increases stock balance and assigns initial shelf-life based on product defaults.
 */
public interface ReceiveStockUseCase extends VoidUseCase<ReceiveStockCommand> {
}
