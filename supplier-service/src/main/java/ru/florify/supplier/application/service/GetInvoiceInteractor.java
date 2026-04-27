package ru.florify.supplier.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.florify.supplier.application.port.in.GetInvoiceUseCase;
import ru.florify.supplier.application.port.out.InvoiceRepository;
import ru.florify.supplier.domain.exception.InvoiceNotFoundException;
import ru.florify.supplier.domain.model.PurchaseInvoice;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetInvoiceInteractor implements GetInvoiceUseCase {

    private final InvoiceRepository invoiceRepository;

    @Override
    public PurchaseInvoice execute(UUID id) {
        return invoiceRepository.findByIdWithItems(id).orElseThrow(() -> new InvoiceNotFoundException(id));
    }
}
