package ru.florify.finance.application.port.in;

import ru.florify.common.usecase.VoidUseCase;
import ru.florify.finance.application.command.RecordTransactionCommand;

public interface RecordTransactionUseCase extends VoidUseCase<RecordTransactionCommand> {
}
