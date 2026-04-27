package ru.florify.supplier.application.port.in;

import ru.florify.common.application.query.PagedResult;
import ru.florify.supplier.domain.model.Supplier;

public interface GetSuppliersUseCase {
    PagedResult<Supplier> execute(String search, Boolean active, int page, int size);
}
