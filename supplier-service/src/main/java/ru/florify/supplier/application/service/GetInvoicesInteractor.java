package ru.florify.supplier.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.application.query.PagedResult;
import ru.florify.supplier.application.port.in.GetInvoicesUseCase;
import ru.florify.supplier.application.port.out.InvoiceRepository;
import ru.florify.supplier.domain.model.InvoiceStatus;
import ru.florify.supplier.domain.model.PurchaseInvoice;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetInvoicesInteractor implements GetInvoicesUseCase {

    private final InvoiceRepository invoiceRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResult<PurchaseInvoice> execute(UUID supplierId, InvoiceStatus status, Instant from, Instant to, int page, int size) {
        return invoiceRepository.findAll(supplierId, status, from, to, page, size);
    }
}
