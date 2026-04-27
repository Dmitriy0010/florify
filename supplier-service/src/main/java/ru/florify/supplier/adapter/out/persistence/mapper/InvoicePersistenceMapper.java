package ru.florify.supplier.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.supplier.adapter.out.persistence.entity.PurchaseInvoiceItemJpaEntity;
import ru.florify.supplier.adapter.out.persistence.entity.PurchaseInvoiceJpaEntity;
import ru.florify.supplier.domain.model.PurchaseInvoice;
import ru.florify.supplier.domain.model.PurchaseInvoiceItem;

@Mapper(componentModel = "spring")
public interface InvoicePersistenceMapper {

    @Mapping(target = "status", expression = "java(invoice.getStatus().name())")
    @Mapping(target = "items", ignore = true)
    PurchaseInvoiceJpaEntity toEntity(PurchaseInvoice invoice);

    @Mapping(target = "status", expression = "java(ru.florify.supplier.domain.model.InvoiceStatus.valueOf(entity.getStatus()))")
    PurchaseInvoice toDomain(PurchaseInvoiceJpaEntity entity);

    PurchaseInvoiceItem toItem(PurchaseInvoiceItemJpaEntity itemEntity);
    PurchaseInvoiceItemJpaEntity toItemEntity(PurchaseInvoiceItem item);
}
