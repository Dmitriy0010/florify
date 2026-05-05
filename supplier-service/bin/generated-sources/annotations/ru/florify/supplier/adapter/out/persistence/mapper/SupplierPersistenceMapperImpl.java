package ru.florify.supplier.adapter.out.persistence.mapper;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.supplier.adapter.out.persistence.entity.SupplierJpaEntity;
import ru.florify.supplier.domain.model.Supplier;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:19:00+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class SupplierPersistenceMapperImpl implements SupplierPersistenceMapper {

    @Override
    public SupplierJpaEntity toEntity(Supplier supplier) {
        if ( supplier == null ) {
            return null;
        }

        SupplierJpaEntity.SupplierJpaEntityBuilder supplierJpaEntity = SupplierJpaEntity.builder();

        supplierJpaEntity.active( supplier.isActive() );
        supplierJpaEntity.address( supplier.getAddress() );
        supplierJpaEntity.contactPerson( supplier.getContactPerson() );
        supplierJpaEntity.createdAt( supplier.getCreatedAt() );
        supplierJpaEntity.email( supplier.getEmail() );
        supplierJpaEntity.id( supplier.getId() );
        supplierJpaEntity.name( supplier.getName() );
        supplierJpaEntity.notes( supplier.getNotes() );
        supplierJpaEntity.paymentTerms( supplier.getPaymentTerms() );
        supplierJpaEntity.phone( supplier.getPhone() );
        supplierJpaEntity.rating( supplier.getRating() );
        supplierJpaEntity.taxId( supplier.getTaxId() );

        return supplierJpaEntity.build();
    }

    @Override
    public Supplier toDomain(SupplierJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        Supplier.SupplierBuilder supplier = Supplier.builder();

        supplier.active( entity.isActive() );
        supplier.address( entity.getAddress() );
        supplier.contactPerson( entity.getContactPerson() );
        supplier.createdAt( entity.getCreatedAt() );
        supplier.email( entity.getEmail() );
        supplier.id( entity.getId() );
        supplier.name( entity.getName() );
        supplier.notes( entity.getNotes() );
        supplier.paymentTerms( entity.getPaymentTerms() );
        supplier.phone( entity.getPhone() );
        supplier.rating( entity.getRating() );
        supplier.taxId( entity.getTaxId() );

        return supplier.build();
    }
}
