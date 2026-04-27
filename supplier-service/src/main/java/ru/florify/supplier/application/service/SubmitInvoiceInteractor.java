package ru.florify.supplier.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.supplier.application.command.SubmitInvoiceCommand;
import ru.florify.supplier.application.port.in.SubmitInvoiceUseCase;
import ru.florify.supplier.application.port.out.InvoiceRepository;
import ru.florify.supplier.application.port.out.SupplierEventPublisher;
import ru.florify.supplier.domain.event.InvoiceSubmittedEvent;
import ru.florify.supplier.domain.exception.InvoiceNotFoundException;

import java.time.Clock;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubmitInvoiceInteractor implements SubmitInvoiceUseCase {

    private final InvoiceRepository invoiceRepository;
    private final ru.florify.supplier.application.port.out.SupplierRepository supplierRepository;
    private final SupplierEventPublisher eventPublisher;
    private final Clock clock;

    @Override
    @Transactional
    public void execute(SubmitInvoiceCommand command) {
        var invoice = invoiceRepository.findById(command.invoiceId())
                .orElseThrow(() -> new InvoiceNotFoundException(command.invoiceId()));
        
        var supplier = supplierRepository.findById(invoice.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found: " + invoice.getSupplierId()));

        Instant now = Instant.now(clock);
        var submitted = invoice.submit();
        invoiceRepository.save(submitted);
        var itemsData = invoice.getItems().stream()
                .map(i -> new InvoiceSubmittedEvent.InvoiceItemData(
                        i.productName(),
                        i.orderedQuantity(),
                        "шт", // Default unit if not in domain
                        i.unitPrice(),
                        i.unitPrice().multiply(i.orderedQuantity())
                ))
                .toList();

        eventPublisher.publish(
                "suppliers.invoice.submitted",
                submitted.getId().toString(),
                InvoiceSubmittedEvent.of(
                        submitted.getId(),
                        submitted.getInvoiceNumber(),
                        submitted.getSupplierId(),
                        supplier.getName(),
                        supplier.getEmail(),
                        itemsData,
                        submitted.computeTotal(),
                        now
                )
        );
        log.info("Invoice {} submitted for supplier {}, email: {}", submitted.getId(), supplier.getName(), supplier.getEmail());
    }
}
