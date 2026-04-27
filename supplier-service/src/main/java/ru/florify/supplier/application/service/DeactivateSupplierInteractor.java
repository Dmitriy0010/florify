package ru.florify.supplier.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.supplier.application.port.in.DeactivateSupplierUseCase;
import ru.florify.supplier.application.port.out.SupplierRepository;
import ru.florify.supplier.domain.exception.SupplierNotFoundException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeactivateSupplierInteractor implements DeactivateSupplierUseCase {

    private final SupplierRepository supplierRepository;

    @Override
    @Transactional
    public void execute(UUID supplierId) {
        var supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new SupplierNotFoundException(supplierId));
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }
}
