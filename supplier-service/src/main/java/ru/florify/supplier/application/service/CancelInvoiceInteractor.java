package ru.florify.supplier.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.supplier.application.command.CancelInvoiceCommand;
import ru.florify.supplier.application.port.in.CancelInvoiceUseCase;
import ru.florify.supplier.application.port.out.InvoiceRepository;
import ru.florify.supplier.domain.exception.InvoiceNotFoundException;

@Service
@RequiredArgsConstructor
public class CancelInvoiceInteractor implements CancelInvoiceUseCase {

    private final InvoiceRepository invoiceRepository;

    @Override
    @Transactional
    public void execute(CancelInvoiceCommand command) {
        var invoice = invoiceRepository.findById(command.invoiceId())
                .orElseThrow(() -> new InvoiceNotFoundException(command.invoiceId()));
        invoiceRepository.save(invoice.cancel());
    }
}
