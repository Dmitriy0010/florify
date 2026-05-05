package ru.florify.supplier.adapter.in.web.mapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.supplier.adapter.in.web.dto.CreateInvoiceItemRequest;
import ru.florify.supplier.adapter.in.web.dto.CreateInvoiceRequest;
import ru.florify.supplier.adapter.in.web.dto.InvoiceItemResponse;
import ru.florify.supplier.adapter.in.web.dto.InvoiceResponse;
import ru.florify.supplier.adapter.in.web.dto.ReceiveInvoiceItemRequest;
import ru.florify.supplier.adapter.in.web.dto.ReceiveInvoiceRequest;
import ru.florify.supplier.application.command.CreateInvoiceCommand;
import ru.florify.supplier.application.command.CreateInvoiceItemCommand;
import ru.florify.supplier.application.command.ReceiveInvoiceCommand;
import ru.florify.supplier.application.command.ReceiveInvoiceItemCommand;
import ru.florify.supplier.application.command.UpdateInvoiceCommand;
import ru.florify.supplier.domain.model.InvoiceStatus;
import ru.florify.supplier.domain.model.PurchaseInvoice;
import ru.florify.supplier.domain.model.PurchaseInvoiceItem;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:19:00+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class InvoiceWebMapperImpl implements InvoiceWebMapper {

    @Override
    public CreateInvoiceCommand toCommand(CreateInvoiceRequest request, UUID performerId) {
        if ( request == null && performerId == null ) {
            return null;
        }

        UUID supplierId = null;
        UUID storeId = null;
        String invoiceNumber = null;
        Instant plannedDeliveryAt = null;
        String comment = null;
        List<CreateInvoiceItemCommand> items = null;
        if ( request != null ) {
            supplierId = request.supplierId();
            storeId = request.storeId();
            invoiceNumber = request.invoiceNumber();
            plannedDeliveryAt = request.plannedDeliveryAt();
            comment = request.comment();
            items = createInvoiceItemRequestListToCreateInvoiceItemCommandList( request.items() );
        }
        UUID performerId1 = null;
        performerId1 = performerId;

        CreateInvoiceCommand createInvoiceCommand = new CreateInvoiceCommand( supplierId, storeId, invoiceNumber, plannedDeliveryAt, comment, performerId1, items );

        return createInvoiceCommand;
    }

    @Override
    public UpdateInvoiceCommand toCommand(UUID invoiceId, CreateInvoiceRequest request, UUID performerId) {
        if ( invoiceId == null && request == null && performerId == null ) {
            return null;
        }

        UUID supplierId = null;
        UUID storeId = null;
        String invoiceNumber = null;
        Instant plannedDeliveryAt = null;
        String comment = null;
        List<CreateInvoiceItemCommand> items = null;
        if ( request != null ) {
            supplierId = request.supplierId();
            storeId = request.storeId();
            invoiceNumber = request.invoiceNumber();
            plannedDeliveryAt = request.plannedDeliveryAt();
            comment = request.comment();
            items = createInvoiceItemRequestListToCreateInvoiceItemCommandList( request.items() );
        }
        UUID invoiceId1 = null;
        invoiceId1 = invoiceId;
        UUID performerId1 = null;
        performerId1 = performerId;

        UpdateInvoiceCommand updateInvoiceCommand = new UpdateInvoiceCommand( invoiceId1, supplierId, storeId, invoiceNumber, plannedDeliveryAt, comment, performerId1, items );

        return updateInvoiceCommand;
    }

    @Override
    public ReceiveInvoiceCommand toCommand(UUID invoiceId, ReceiveInvoiceRequest request, UUID performerId) {
        if ( invoiceId == null && request == null && performerId == null ) {
            return null;
        }

        UUID storeId = null;
        List<ReceiveInvoiceItemCommand> items = null;
        if ( request != null ) {
            storeId = request.storeId();
            items = receiveInvoiceItemRequestListToReceiveInvoiceItemCommandList( request.items() );
        }
        UUID invoiceId1 = null;
        invoiceId1 = invoiceId;
        UUID performerId1 = null;
        performerId1 = performerId;

        ReceiveInvoiceCommand receiveInvoiceCommand = new ReceiveInvoiceCommand( invoiceId1, storeId, performerId1, items );

        return receiveInvoiceCommand;
    }

    @Override
    public InvoiceResponse toResponse(PurchaseInvoice invoice) {
        if ( invoice == null ) {
            return null;
        }

        UUID id = null;
        String invoiceNumber = null;
        UUID supplierId = null;
        String supplierName = null;
        UUID storeId = null;
        InvoiceStatus status = null;
        BigDecimal totalAmount = null;
        Instant plannedDeliveryAt = null;
        Instant receivedAt = null;
        String comment = null;
        UUID createdBy = null;
        Instant createdAt = null;
        List<InvoiceItemResponse> items = null;

        id = invoice.getId();
        invoiceNumber = invoice.getInvoiceNumber();
        supplierId = invoice.getSupplierId();
        supplierName = invoice.getSupplierName();
        storeId = invoice.getStoreId();
        status = invoice.getStatus();
        totalAmount = invoice.getTotalAmount();
        plannedDeliveryAt = invoice.getPlannedDeliveryAt();
        receivedAt = invoice.getReceivedAt();
        comment = invoice.getComment();
        createdBy = invoice.getCreatedBy();
        createdAt = invoice.getCreatedAt();
        items = purchaseInvoiceItemListToInvoiceItemResponseList( invoice.getItems() );

        InvoiceResponse invoiceResponse = new InvoiceResponse( id, invoiceNumber, supplierId, supplierName, storeId, status, totalAmount, plannedDeliveryAt, receivedAt, comment, createdBy, createdAt, items );

        return invoiceResponse;
    }

    protected CreateInvoiceItemCommand createInvoiceItemRequestToCreateInvoiceItemCommand(CreateInvoiceItemRequest createInvoiceItemRequest) {
        if ( createInvoiceItemRequest == null ) {
            return null;
        }

        UUID productId = null;
        String productName = null;
        BigDecimal orderedQuantity = null;
        BigDecimal unitPrice = null;
        LocalDate expiresAt = null;

        productId = createInvoiceItemRequest.productId();
        productName = createInvoiceItemRequest.productName();
        orderedQuantity = createInvoiceItemRequest.orderedQuantity();
        unitPrice = createInvoiceItemRequest.unitPrice();
        expiresAt = createInvoiceItemRequest.expiresAt();

        CreateInvoiceItemCommand createInvoiceItemCommand = new CreateInvoiceItemCommand( productId, productName, orderedQuantity, unitPrice, expiresAt );

        return createInvoiceItemCommand;
    }

    protected List<CreateInvoiceItemCommand> createInvoiceItemRequestListToCreateInvoiceItemCommandList(List<CreateInvoiceItemRequest> list) {
        if ( list == null ) {
            return null;
        }

        List<CreateInvoiceItemCommand> list1 = new ArrayList<CreateInvoiceItemCommand>( list.size() );
        for ( CreateInvoiceItemRequest createInvoiceItemRequest : list ) {
            list1.add( createInvoiceItemRequestToCreateInvoiceItemCommand( createInvoiceItemRequest ) );
        }

        return list1;
    }

    protected ReceiveInvoiceItemCommand receiveInvoiceItemRequestToReceiveInvoiceItemCommand(ReceiveInvoiceItemRequest receiveInvoiceItemRequest) {
        if ( receiveInvoiceItemRequest == null ) {
            return null;
        }

        UUID itemId = null;
        BigDecimal receivedQuantity = null;

        itemId = receiveInvoiceItemRequest.itemId();
        receivedQuantity = receiveInvoiceItemRequest.receivedQuantity();

        ReceiveInvoiceItemCommand receiveInvoiceItemCommand = new ReceiveInvoiceItemCommand( itemId, receivedQuantity );

        return receiveInvoiceItemCommand;
    }

    protected List<ReceiveInvoiceItemCommand> receiveInvoiceItemRequestListToReceiveInvoiceItemCommandList(List<ReceiveInvoiceItemRequest> list) {
        if ( list == null ) {
            return null;
        }

        List<ReceiveInvoiceItemCommand> list1 = new ArrayList<ReceiveInvoiceItemCommand>( list.size() );
        for ( ReceiveInvoiceItemRequest receiveInvoiceItemRequest : list ) {
            list1.add( receiveInvoiceItemRequestToReceiveInvoiceItemCommand( receiveInvoiceItemRequest ) );
        }

        return list1;
    }

    protected InvoiceItemResponse purchaseInvoiceItemToInvoiceItemResponse(PurchaseInvoiceItem purchaseInvoiceItem) {
        if ( purchaseInvoiceItem == null ) {
            return null;
        }

        UUID id = null;
        UUID productId = null;
        String productName = null;
        BigDecimal orderedQuantity = null;
        BigDecimal receivedQuantity = null;
        BigDecimal unitPrice = null;
        LocalDate expiresAt = null;

        id = purchaseInvoiceItem.id();
        productId = purchaseInvoiceItem.productId();
        productName = purchaseInvoiceItem.productName();
        orderedQuantity = purchaseInvoiceItem.orderedQuantity();
        receivedQuantity = purchaseInvoiceItem.receivedQuantity();
        unitPrice = purchaseInvoiceItem.unitPrice();
        expiresAt = purchaseInvoiceItem.expiresAt();

        InvoiceItemResponse invoiceItemResponse = new InvoiceItemResponse( id, productId, productName, orderedQuantity, receivedQuantity, unitPrice, expiresAt );

        return invoiceItemResponse;
    }

    protected List<InvoiceItemResponse> purchaseInvoiceItemListToInvoiceItemResponseList(List<PurchaseInvoiceItem> list) {
        if ( list == null ) {
            return null;
        }

        List<InvoiceItemResponse> list1 = new ArrayList<InvoiceItemResponse>( list.size() );
        for ( PurchaseInvoiceItem purchaseInvoiceItem : list ) {
            list1.add( purchaseInvoiceItemToInvoiceItemResponse( purchaseInvoiceItem ) );
        }

        return list1;
    }
}
