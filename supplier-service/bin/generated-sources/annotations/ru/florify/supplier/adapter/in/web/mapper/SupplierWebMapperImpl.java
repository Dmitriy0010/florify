package ru.florify.supplier.adapter.in.web.mapper;

import java.time.Instant;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.supplier.adapter.in.web.dto.CreateSupplierRequest;
import ru.florify.supplier.adapter.in.web.dto.SupplierResponse;
import ru.florify.supplier.adapter.in.web.dto.SupplierSummaryResponse;
import ru.florify.supplier.adapter.in.web.dto.UpdateSupplierRequest;
import ru.florify.supplier.application.command.CreateSupplierCommand;
import ru.florify.supplier.application.command.UpdateSupplierCommand;
import ru.florify.supplier.domain.model.PaymentTerms;
import ru.florify.supplier.domain.model.Supplier;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:19:00+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class SupplierWebMapperImpl implements SupplierWebMapper {

    @Override
    public CreateSupplierCommand toCommand(CreateSupplierRequest request) {
        if ( request == null ) {
            return null;
        }

        String name = null;
        String contactPerson = null;
        String phone = null;
        String email = null;
        String address = null;
        String taxId = null;
        PaymentTerms paymentTerms = null;
        Integer rating = null;
        String notes = null;

        name = request.name();
        contactPerson = request.contactPerson();
        phone = request.phone();
        email = request.email();
        address = request.address();
        taxId = request.taxId();
        paymentTerms = request.paymentTerms();
        rating = request.rating();
        notes = request.notes();

        CreateSupplierCommand createSupplierCommand = new CreateSupplierCommand( name, contactPerson, phone, email, address, taxId, paymentTerms, rating, notes );

        return createSupplierCommand;
    }

    @Override
    public UpdateSupplierCommand toCommand(UUID supplierId, UpdateSupplierRequest request) {
        if ( supplierId == null && request == null ) {
            return null;
        }

        String name = null;
        String contactPerson = null;
        String phone = null;
        String email = null;
        String address = null;
        String taxId = null;
        PaymentTerms paymentTerms = null;
        Integer rating = null;
        String notes = null;
        if ( request != null ) {
            name = request.name();
            contactPerson = request.contactPerson();
            phone = request.phone();
            email = request.email();
            address = request.address();
            taxId = request.taxId();
            paymentTerms = request.paymentTerms();
            rating = request.rating();
            notes = request.notes();
        }
        UUID supplierId1 = null;
        supplierId1 = supplierId;

        UpdateSupplierCommand updateSupplierCommand = new UpdateSupplierCommand( supplierId1, name, contactPerson, phone, email, address, taxId, paymentTerms, rating, notes );

        return updateSupplierCommand;
    }

    @Override
    public SupplierResponse toResponse(Supplier supplier) {
        if ( supplier == null ) {
            return null;
        }

        UUID id = null;
        String name = null;
        String contactPerson = null;
        String phone = null;
        String email = null;
        String address = null;
        String taxId = null;
        PaymentTerms paymentTerms = null;
        Integer rating = null;
        String notes = null;
        boolean active = false;
        Instant createdAt = null;

        id = supplier.getId();
        name = supplier.getName();
        contactPerson = supplier.getContactPerson();
        phone = supplier.getPhone();
        email = supplier.getEmail();
        address = supplier.getAddress();
        taxId = supplier.getTaxId();
        paymentTerms = supplier.getPaymentTerms();
        rating = supplier.getRating();
        notes = supplier.getNotes();
        active = supplier.isActive();
        createdAt = supplier.getCreatedAt();

        SupplierResponse supplierResponse = new SupplierResponse( id, name, contactPerson, phone, email, address, taxId, paymentTerms, rating, notes, active, createdAt );

        return supplierResponse;
    }

    @Override
    public SupplierSummaryResponse toSummaryResponse(Supplier supplier) {
        if ( supplier == null ) {
            return null;
        }

        UUID id = null;
        String name = null;
        String phone = null;
        String email = null;
        boolean active = false;

        id = supplier.getId();
        name = supplier.getName();
        phone = supplier.getPhone();
        email = supplier.getEmail();
        active = supplier.isActive();

        SupplierSummaryResponse supplierSummaryResponse = new SupplierSummaryResponse( id, name, phone, email, active );

        return supplierSummaryResponse;
    }
}
