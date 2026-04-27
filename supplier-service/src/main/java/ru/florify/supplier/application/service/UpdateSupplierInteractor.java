package ru.florify.supplier.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.supplier.application.command.UpdateSupplierCommand;
import ru.florify.supplier.application.port.in.UpdateSupplierUseCase;
import ru.florify.supplier.application.port.out.SupplierRepository;
import ru.florify.supplier.domain.exception.SupplierNotFoundException;
import ru.florify.supplier.domain.model.Supplier;

@Service
@RequiredArgsConstructor
public class UpdateSupplierInteractor implements UpdateSupplierUseCase {

    private final SupplierRepository supplierRepository;

    @Override
    @Transactional
    public Supplier execute(UpdateSupplierCommand command) {
        Supplier existing = supplierRepository.findById(command.supplierId())
                .orElseThrow(() -> new SupplierNotFoundException(command.supplierId()));
        Supplier updated = existing.toBuilder()
                .name(command.name())
                .contactPerson(command.contactPerson())
                .phone(command.phone())
                .email(command.email())
                .address(command.address())
                .taxId(command.taxId())
                .paymentTerms(command.paymentTerms())
                .rating(command.rating())
                .notes(command.notes())
                .build();
        return supplierRepository.save(updated);
    }
}
