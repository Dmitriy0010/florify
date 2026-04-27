package ru.florify.supplier.application.port.out;

import ru.florify.common.application.query.PagedResult;
import ru.florify.supplier.domain.model.Supplier;

import java.util.Optional;
import java.util.UUID;

public interface SupplierRepository {
    Supplier save(Supplier supplier);
    Optional<Supplier> findById(UUID id);
    PagedResult<Supplier> findAll(String search, Boolean active, int page, int size);
    boolean existsByTaxId(String taxId);
}
