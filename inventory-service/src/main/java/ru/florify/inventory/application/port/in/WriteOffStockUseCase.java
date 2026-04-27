package ru.florify.inventory.application.port.in;

import ru.florify.common.usecase.UseCase;
import ru.florify.inventory.application.command.WriteOffCommand;

import java.math.BigDecimal;

/**
 * Use case for writing off stock items (e.g., due to damage, loss, or waste).
 * Deducts quantity from batches and calculates the COGS impact.
 */
public interface WriteOffStockUseCase extends UseCase<WriteOffCommand, BigDecimal> {
}
