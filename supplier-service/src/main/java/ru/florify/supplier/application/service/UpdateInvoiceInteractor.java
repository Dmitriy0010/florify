package ru.florify.supplier.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.exception.ConflictException;
import ru.florify.common.exception.NotFoundException;
import ru.florify.supplier.application.command.UpdateInvoiceCommand;
import ru.florify.supplier.application.port.in.UpdateInvoiceUseCase;
import ru.florify.supplier.application.port.out.InvoiceRepository;
import ru.florify.supplier.application.port.out.SupplierRepository;
import ru.florify.supplier.domain.exception.InactiveSupplierException;
import ru.florify.supplier.domain.exception.SupplierNotFoundException;
import ru.florify.supplier.domain.model.InvoiceStatus;
import ru.florify.supplier.domain.model.PurchaseInvoice;
import ru.florify.supplier.domain.model.PurchaseInvoiceItem;
import ru.florify.supplier.domain.model.Supplier;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UpdateInvoiceInteractor implements UpdateInvoiceUseCase {

    private final InvoiceRepository invoiceRepository;
    private final SupplierRepository supplierRepository;

    @Override
    @Transactional
    public PurchaseInvoice execute(UpdateInvoiceCommand command) {
        PurchaseInvoice existing = invoiceRepository.findById(command.invoiceId())
                .orElseThrow(() -> new NotFoundException("Invoice", command.invoiceId()));

        if (existing.getStatus() != InvoiceStatus.DRAFT) {
            throw new ConflictException("Only draft invoices can be updated");
        }

        Supplier supplier = supplierRepository.findById(command.supplierId())
                .orElseThrow(() -> new SupplierNotFoundException(command.supplierId()));
        if (!supplier.isActive()) {
            throw new InactiveSupplierException(command.supplierId());
        }

        // Mapping items
        List<PurchaseInvoiceItem> items = command.items().stream()
                .map(item -> new PurchaseInvoiceItem(
                        UUID.randomUUID(),
                        command.invoiceId(),
                        item.productId(),
                        item.productName(),
                        item.orderedQuantity(),
                        BigDecimal.ZERO,
                        item.unitPrice(),
                        item.expiresAt()
                ))
                .toList();

        PurchaseInvoice updated = existing.toBuilder()
                .supplierId(command.supplierId())
                .supplierName(supplier.getName())
                .storeId(command.storeId())
                .invoiceNumber(command.invoiceNumber())
                .plannedDeliveryAt(command.plannedDeliveryAt())
                .comment(command.comment())
                .items(items)
                .build();

        return invoiceRepository.save(updated.toBuilder().totalAmount(updated.computeTotal()).build());
    }
}
