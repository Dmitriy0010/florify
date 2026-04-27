package ru.florify.supplier.application.port.in;

import ru.florify.common.usecase.UseCase;
import ru.florify.supplier.domain.model.PurchaseInvoice;

import java.util.UUID;

public interface GetInvoiceUseCase extends UseCase<UUID, PurchaseInvoice> {
}
