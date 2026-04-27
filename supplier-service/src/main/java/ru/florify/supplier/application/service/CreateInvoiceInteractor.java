package ru.florify.supplier.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.exception.ConflictException;
import ru.florify.supplier.application.command.CreateInvoiceCommand;
import ru.florify.supplier.application.port.in.CreateInvoiceUseCase;
import ru.florify.supplier.application.port.out.InvoiceRepository;
import ru.florify.supplier.application.port.out.SupplierRepository;
import ru.florify.supplier.domain.exception.InactiveSupplierException;
import ru.florify.supplier.domain.exception.SupplierNotFoundException;
import ru.florify.supplier.domain.model.InvoiceStatus;
import ru.florify.supplier.domain.model.PurchaseInvoice;
import ru.florify.supplier.domain.model.PurchaseInvoiceItem;
import ru.florify.supplier.domain.model.Supplier;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreateInvoiceInteractor implements CreateInvoiceUseCase {

    private final InvoiceRepository invoiceRepository;
    private final SupplierRepository supplierRepository;
    private final Clock clock;

    @Override
    @Transactional
    public PurchaseInvoice execute(CreateInvoiceCommand command) {
        Supplier supplier = supplierRepository.findById(command.supplierId())
                .orElseThrow(() -> new SupplierNotFoundException(command.supplierId()));
        if (!supplier.isActive()) {
            throw new InactiveSupplierException(command.supplierId());
        }
        if (invoiceRepository.existsBySupplierIdAndInvoiceNumber(command.supplierId(), command.invoiceNumber())) {
            throw new ConflictException("Invoice number '" + command.invoiceNumber() + "' already exists for this supplier");
        }

        Instant now = Instant.now(clock);
        UUID invoiceId = UUID.randomUUID();
        List<PurchaseInvoiceItem> items = command.items().stream()
                .map(item -> new PurchaseInvoiceItem(
                        UUID.randomUUID(),
                        invoiceId,
                        item.productId(),
                        item.productName(),
                        item.orderedQuantity(),
                        BigDecimal.ZERO,
                        item.unitPrice(),
                        item.expiresAt()
                ))
                .toList();

        PurchaseInvoice invoice = PurchaseInvoice.builder()
                .id(invoiceId)
                .invoiceNumber(command.invoiceNumber())
                .supplierId(command.supplierId())
                .storeId(command.storeId())
                .supplierName(supplier.getName())
                .status(InvoiceStatus.DRAFT)
                .items(items)
                .totalAmount(BigDecimal.ZERO)
                .plannedDeliveryAt(command.plannedDeliveryAt())
                .comment(command.comment())
                .createdBy(command.performerId())
                .createdAt(now)
                .build();
        return invoiceRepository.save(invoice.toBuilder().totalAmount(invoice.computeTotal()).build());
    }
}
