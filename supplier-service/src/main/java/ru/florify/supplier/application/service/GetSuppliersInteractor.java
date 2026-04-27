package ru.florify.supplier.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.florify.common.application.query.PagedResult;
import ru.florify.supplier.application.port.in.GetSuppliersUseCase;
import ru.florify.supplier.application.port.out.SupplierRepository;
import ru.florify.supplier.domain.model.Supplier;

@Service
@RequiredArgsConstructor
public class GetSuppliersInteractor implements GetSuppliersUseCase {

    private final SupplierRepository supplierRepository;

    @Override
    public PagedResult<Supplier> execute(String search, Boolean active, int page, int size) {
        return supplierRepository.findAll(search, active, page, size);
    }
}
