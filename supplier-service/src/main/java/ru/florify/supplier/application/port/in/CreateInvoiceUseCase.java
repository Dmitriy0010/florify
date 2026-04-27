package ru.florify.supplier.application.port.in;

import ru.florify.common.usecase.UseCase;
import ru.florify.supplier.application.command.CreateInvoiceCommand;
import ru.florify.supplier.domain.model.PurchaseInvoice;

public interface CreateInvoiceUseCase extends UseCase<CreateInvoiceCommand, PurchaseInvoice> {
}
