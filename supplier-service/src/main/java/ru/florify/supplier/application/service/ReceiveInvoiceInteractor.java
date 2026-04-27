package ru.florify.supplier.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.exception.DomainException;
import ru.florify.supplier.application.command.ReceiveInvoiceCommand;
import ru.florify.supplier.application.command.ReceiveInvoiceItemCommand;
import ru.florify.supplier.application.port.in.ReceiveInvoiceUseCase;
import ru.florify.supplier.application.port.out.InvoiceRepository;
import ru.florify.supplier.application.port.out.SupplierEventPublisher;
import ru.florify.supplier.domain.event.InvoiceReceivedEvent;
import ru.florify.supplier.domain.exception.InvoiceNotFoundException;
import ru.florify.supplier.domain.model.InvoiceStatus;
import ru.florify.supplier.domain.model.PurchaseInvoiceItem;

import java.math.BigDecimal;
import java.time.Clock;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReceiveInvoiceInteractor implements ReceiveInvoiceUseCase {

    private final InvoiceRepository invoiceRepository;
    private final SupplierEventPublisher supplierEventPublisher;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    @Override
    @Transactional
    public void execute(ReceiveInvoiceCommand command) {
        var invoice = invoiceRepository.findByIdWithItems(command.invoiceId())
                .orElseThrow(() -> new InvoiceNotFoundException(command.invoiceId()));
        var now = clock.instant();

        List<PurchaseInvoiceItem> receivedItems = mergeReceivedQuantities(invoice.getItems(), command.items());
        var invoiceWithItems = invoice.toBuilder().items(receivedItems).build();
        boolean isFullyReceived = invoiceWithItems.isFullyReceived();

        var updated = switch (invoice.getStatus()) {
            case SUBMITTED -> isFullyReceived ? invoiceWithItems.receive(now) : invoiceWithItems.partialReceive(now);
            case PARTIALLY_RECEIVED -> isFullyReceived ? invoiceWithItems.completePartialReceipt(now) : invoiceWithItems;
            default -> throw new DomainException("INVALID_INVOICE_RECEIVE_STATUS", "Cannot receive invoice in status: " + invoice.getStatus());
        };

        BigDecimal actualTotal = receivedItems.stream()
                .map(i -> i.unitPrice().multiply(i.receivedQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        UUID effectiveStoreId = command.storeId() != null ? command.storeId() : invoice.getStoreId();

        var finalInvoice = updated.toBuilder()
                .storeId(effectiveStoreId)
                .totalAmount(actualTotal)
                .build();
        invoiceRepository.save(finalInvoice);

        List<PurchaseInvoiceItem> itemsToSend = receivedItems.stream()
                .filter(i -> i.receivedQuantity().compareTo(BigDecimal.ZERO) > 0)
                .toList();
        supplierEventPublisher.publish(
                "suppliers.invoice.received",
                finalInvoice.getId().toString(),
                InvoiceReceivedEvent.of(finalInvoice.getId(), finalInvoice.getSupplierId(), finalInvoice.getStoreId(), itemsToSend, now)
        );
        
        // Spring Event для finance-service 
        eventPublisher.publishEvent(ru.florify.common.event.InvoiceReceivedSpringEvent.of(
                finalInvoice.getId(),
                finalInvoice.getSupplierId(),
                finalInvoice.getStoreId(),
                actualTotal,
                now
        ));
        
        log.info("Invoice {} received with status {}", finalInvoice.getId(), finalInvoice.getStatus());
    }

    private List<PurchaseInvoiceItem> mergeReceivedQuantities(
            List<PurchaseInvoiceItem> existingItems,
            List<ReceiveInvoiceItemCommand> receivedItems) {
        Map<UUID, BigDecimal> receivedMap = receivedItems.stream()
                .collect(Collectors.toMap(ReceiveInvoiceItemCommand::itemId, ReceiveInvoiceItemCommand::receivedQuantity));
        for (UUID itemId : receivedMap.keySet()) {
            boolean exists = existingItems.stream().anyMatch(i -> i.id().equals(itemId));
            if (!exists) {
                throw new DomainException("INVOICE_ITEM_NOT_FOUND",
                        "Item ID " + itemId + " not found in invoice");
            }
        }
        return existingItems.stream()
                .map(item -> item.withReceivedQuantity(receivedMap.getOrDefault(item.id(), BigDecimal.ZERO)))
                .toList();
    }
}
