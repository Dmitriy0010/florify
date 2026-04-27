package ru.florify.supplier.application.port.in;

import ru.florify.common.usecase.UseCase;
import ru.florify.supplier.application.command.CreateSupplierCommand;
import ru.florify.supplier.domain.model.Supplier;

public interface CreateSupplierUseCase extends UseCase<CreateSupplierCommand, Supplier> {
}
