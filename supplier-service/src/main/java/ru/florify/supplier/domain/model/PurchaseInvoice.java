package ru.florify.supplier.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.florify.supplier.domain.exception.InvalidInvoiceStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PurchaseInvoice {

    @EqualsAndHashCode.Include
    private UUID id;

    private String invoiceNumber;
    private UUID supplierId;
    private UUID storeId;
    private String supplierName;
    private InvoiceStatus status;
    private List<PurchaseInvoiceItem> items;
    private BigDecimal totalAmount;
    private Instant plannedDeliveryAt;
    private Instant receivedAt;
    private String comment;
    private UUID createdBy;
    private Instant createdAt;

    public PurchaseInvoice submit() {
        if (this.status != InvoiceStatus.DRAFT) {
            throw new InvalidInvoiceStatusException(
                    "Cannot submit invoice with status: " + status + ". Expected: DRAFT");
        }
        return this.toBuilder()
                .status(InvoiceStatus.SUBMITTED)
                .build();
    }

    public PurchaseInvoice receive(Instant now) {
        if (this.status != InvoiceStatus.SUBMITTED) {
            throw new InvalidInvoiceStatusException(
                    "Cannot receive invoice with status: " + status + ". Expected: SUBMITTED");
        }
        return this.toBuilder()
                .status(InvoiceStatus.RECEIVED)
                .receivedAt(now)
                .build();
    }

    public PurchaseInvoice partialReceive(Instant now) {
        if (this.status != InvoiceStatus.SUBMITTED) {
            throw new InvalidInvoiceStatusException(
                    "Cannot partial-receive invoice with status: " + status);
        }
        return this.toBuilder()
                .status(InvoiceStatus.PARTIALLY_RECEIVED)
                .receivedAt(now)
                .build();
    }

    public PurchaseInvoice completePartialReceipt(Instant now) {
        if (this.status != InvoiceStatus.PARTIALLY_RECEIVED) {
            throw new InvalidInvoiceStatusException(
                    "Cannot complete partial receipt for invoice with status: " + status
                            + ". Expected: PARTIALLY_RECEIVED");
        }
        return this.toBuilder()
                .status(InvoiceStatus.RECEIVED)
                .receivedAt(now)
                .build();
    }

    public PurchaseInvoice cancel() {
        if (this.status == InvoiceStatus.RECEIVED) {
            throw new InvalidInvoiceStatusException(
                    "Cannot cancel already RECEIVED invoice. Create a write-off in inventory-service instead.");
        }
        return this.toBuilder()
                .status(InvoiceStatus.CANCELLED)
                .build();
    }

    public BigDecimal computeTotal() {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return items.stream()
                .map(i -> i.unitPrice().multiply(i.orderedQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public boolean isFullyReceived() {
        if (items == null) {
            return false;
        }
        return items.stream().allMatch(PurchaseInvoiceItem::isFullyReceived);
    }
}
