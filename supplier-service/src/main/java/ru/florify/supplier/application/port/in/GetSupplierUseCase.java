package ru.florify.supplier.application.port.in;

import ru.florify.common.usecase.UseCase;
import ru.florify.supplier.domain.model.Supplier;

import java.util.UUID;

public interface GetSupplierUseCase extends UseCase<UUID, Supplier> {
}
