package ru.florify.supplier.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.exception.ConflictException;
import ru.florify.supplier.application.command.CreateSupplierCommand;
import ru.florify.supplier.application.port.in.CreateSupplierUseCase;
import ru.florify.supplier.application.port.out.SupplierRepository;
import ru.florify.supplier.domain.model.Supplier;

import java.time.Clock;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreateSupplierInteractor implements CreateSupplierUseCase {

    private final SupplierRepository supplierRepository;
    private final Clock clock;

    @Override
    @Transactional
    public Supplier execute(CreateSupplierCommand command) {
        if (command.taxId() != null && supplierRepository.existsByTaxId(command.taxId())) {
            throw new ConflictException("Supplier with taxId '" + command.taxId() + "' already exists");
        }
        Supplier supplier = Supplier.builder()
                .id(UUID.randomUUID())
                .name(command.name())
                .contactPerson(command.contactPerson())
                .phone(command.phone())
                .email(command.email())
                .address(command.address())
                .taxId(command.taxId())
                .paymentTerms(command.paymentTerms())
                .rating(command.rating())
                .notes(command.notes())
                .active(true)
                .createdAt(clock.instant())
                .build();
        return supplierRepository.save(supplier);
    }
}
