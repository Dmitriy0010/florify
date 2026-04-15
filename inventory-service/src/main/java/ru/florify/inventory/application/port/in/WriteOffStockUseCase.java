package ru.florify.inventory.application.port.in;

import ru.florify.common.usecase.VoidUseCase;
import ru.florify.inventory.application.command.WriteOffCommand;

public interface WriteOffStockUseCase extends VoidUseCase<WriteOffCommand> {
}
