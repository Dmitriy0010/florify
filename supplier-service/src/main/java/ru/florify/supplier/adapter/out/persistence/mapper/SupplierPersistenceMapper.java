package ru.florify.supplier.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ru.florify.supplier.adapter.out.persistence.entity.SupplierJpaEntity;
import ru.florify.supplier.domain.model.Supplier;

@Mapper(componentModel = "spring")
public interface SupplierPersistenceMapper {
    SupplierJpaEntity toEntity(Supplier supplier);
    Supplier toDomain(SupplierJpaEntity entity);
}
