package ru.florify.supplier.application.port.in;

import ru.florify.common.usecase.VoidUseCase;
import ru.florify.supplier.application.command.CancelInvoiceCommand;

public interface CancelInvoiceUseCase extends VoidUseCase<CancelInvoiceCommand> {
}
