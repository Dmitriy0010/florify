package ru.florify.supplier.application.port.in;

import ru.florify.common.usecase.UseCase;
import ru.florify.supplier.application.command.UpdateSupplierCommand;
import ru.florify.supplier.domain.model.Supplier;

public interface UpdateSupplierUseCase extends UseCase<UpdateSupplierCommand, Supplier> {
}
