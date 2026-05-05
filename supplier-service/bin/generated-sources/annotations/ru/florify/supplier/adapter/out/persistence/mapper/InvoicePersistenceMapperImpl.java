package ru.florify.supplier.adapter.out.persistence.mapper;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.supplier.adapter.out.persistence.entity.PurchaseInvoiceItemJpaEntity;
import ru.florify.supplier.adapter.out.persistence.entity.PurchaseInvoiceJpaEntity;
import ru.florify.supplier.domain.model.PurchaseInvoice;
import ru.florify.supplier.domain.model.PurchaseInvoiceItem;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:19:00+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class InvoicePersistenceMapperImpl implements InvoicePersistenceMapper {

    @Override
    public PurchaseInvoiceJpaEntity toEntity(PurchaseInvoice invoice) {
        if ( invoice == null ) {
            return null;
        }

        PurchaseInvoiceJpaEntity.PurchaseInvoiceJpaEntityBuilder purchaseInvoiceJpaEntity = PurchaseInvoiceJpaEntity.builder();

        purchaseInvoiceJpaEntity.comment( invoice.getComment() );
        purchaseInvoiceJpaEntity.createdAt( invoice.getCreatedAt() );
        purchaseInvoiceJpaEntity.createdBy( invoice.getCreatedBy() );
        purchaseInvoiceJpaEntity.id( invoice.getId() );
        purchaseInvoiceJpaEntity.invoiceNumber( invoice.getInvoiceNumber() );
        purchaseInvoiceJpaEntity.plannedDeliveryAt( invoice.getPlannedDeliveryAt() );
        purchaseInvoiceJpaEntity.receivedAt( invoice.getReceivedAt() );
        purchaseInvoiceJpaEntity.storeId( invoice.getStoreId() );
        purchaseInvoiceJpaEntity.supplierId( invoice.getSupplierId() );
        purchaseInvoiceJpaEntity.supplierName( invoice.getSupplierName() );
        purchaseInvoiceJpaEntity.totalAmount( invoice.getTotalAmount() );

        purchaseInvoiceJpaEntity.status( invoice.getStatus().name() );

        return purchaseInvoiceJpaEntity.build();
    }

    @Override
    public PurchaseInvoice toDomain(PurchaseInvoiceJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        PurchaseInvoice.PurchaseInvoiceBuilder purchaseInvoice = PurchaseInvoice.builder();

        purchaseInvoice.comment( entity.getComment() );
        purchaseInvoice.createdAt( entity.getCreatedAt() );
        purchaseInvoice.createdBy( entity.getCreatedBy() );
        purchaseInvoice.id( entity.getId() );
        purchaseInvoice.invoiceNumber( entity.getInvoiceNumber() );
        purchaseInvoice.items( purchaseInvoiceItemJpaEntityListToPurchaseInvoiceItemList( entity.getItems() ) );
        purchaseInvoice.plannedDeliveryAt( entity.getPlannedDeliveryAt() );
        purchaseInvoice.receivedAt( entity.getReceivedAt() );
        purchaseInvoice.storeId( entity.getStoreId() );
        purchaseInvoice.supplierId( entity.getSupplierId() );
        purchaseInvoice.supplierName( entity.getSupplierName() );
        purchaseInvoice.totalAmount( entity.getTotalAmount() );

        purchaseInvoice.status( ru.florify.supplier.domain.model.InvoiceStatus.valueOf(entity.getStatus()) );

        return purchaseInvoice.build();
    }

    @Override
    public PurchaseInvoiceItem toItem(PurchaseInvoiceItemJpaEntity itemEntity) {
        if ( itemEntity == null ) {
            return null;
        }

        PurchaseInvoiceItem.PurchaseInvoiceItemBuilder purchaseInvoiceItem = PurchaseInvoiceItem.builder();

        purchaseInvoiceItem.expiresAt( itemEntity.getExpiresAt() );
        purchaseInvoiceItem.id( itemEntity.getId() );
        purchaseInvoiceItem.invoiceId( itemEntity.getInvoiceId() );
        purchaseInvoiceItem.orderedQuantity( itemEntity.getOrderedQuantity() );
        purchaseInvoiceItem.productId( itemEntity.getProductId() );
        purchaseInvoiceItem.productName( itemEntity.getProductName() );
        purchaseInvoiceItem.receivedQuantity( itemEntity.getReceivedQuantity() );
        purchaseInvoiceItem.unitPrice( itemEntity.getUnitPrice() );

        return purchaseInvoiceItem.build();
    }

    @Override
    public PurchaseInvoiceItemJpaEntity toItemEntity(PurchaseInvoiceItem item) {
        if ( item == null ) {
            return null;
        }

        PurchaseInvoiceItemJpaEntity.PurchaseInvoiceItemJpaEntityBuilder purchaseInvoiceItemJpaEntity = PurchaseInvoiceItemJpaEntity.builder();

        purchaseInvoiceItemJpaEntity.expiresAt( item.expiresAt() );
        purchaseInvoiceItemJpaEntity.id( item.id() );
        purchaseInvoiceItemJpaEntity.invoiceId( item.invoiceId() );
        purchaseInvoiceItemJpaEntity.orderedQuantity( item.orderedQuantity() );
        purchaseInvoiceItemJpaEntity.productId( item.productId() );
        purchaseInvoiceItemJpaEntity.productName( item.productName() );
        purchaseInvoiceItemJpaEntity.receivedQuantity( item.receivedQuantity() );
        purchaseInvoiceItemJpaEntity.unitPrice( item.unitPrice() );

        return purchaseInvoiceItemJpaEntity.build();
    }

    protected List<PurchaseInvoiceItem> purchaseInvoiceItemJpaEntityListToPurchaseInvoiceItemList(List<PurchaseInvoiceItemJpaEntity> list) {
        if ( list == null ) {
            return null;
        }

        List<PurchaseInvoiceItem> list1 = new ArrayList<PurchaseInvoiceItem>( list.size() );
        for ( PurchaseInvoiceItemJpaEntity purchaseInvoiceItemJpaEntity : list ) {
            list1.add( toItem( purchaseInvoiceItemJpaEntity ) );
        }

        return list1;
    }
}
