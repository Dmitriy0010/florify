package ru.florify.supplier.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.florify.supplier.application.port.in.GetSupplierUseCase;
import ru.florify.supplier.application.port.out.SupplierRepository;
import ru.florify.supplier.domain.exception.SupplierNotFoundException;
import ru.florify.supplier.domain.model.Supplier;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetSupplierInteractor implements GetSupplierUseCase {

    private final SupplierRepository supplierRepository;

    @Override
    public Supplier execute(UUID id) {
        return supplierRepository.findById(id).orElseThrow(() -> new SupplierNotFoundException(id));
    }
}
