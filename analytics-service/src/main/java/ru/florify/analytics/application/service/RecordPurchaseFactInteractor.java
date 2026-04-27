package ru.florify.analytics.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.application.command.RecordPurchaseFactCommand;
import ru.florify.analytics.application.port.in.RecordPurchaseFactUseCase;
import ru.florify.analytics.application.port.out.PurchaseFactRepository;
import ru.florify.analytics.domain.model.PurchaseFact;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecordPurchaseFactInteractor implements RecordPurchaseFactUseCase {
    private final PurchaseFactRepository repository;

    @Override
    @Transactional
    public void record(RecordPurchaseFactCommand cmd) {
        if (repository.existsByInvoiceId(cmd.invoiceId())) {
            return;
        }
        PurchaseFact fact = PurchaseFact.builder()
                .id(UUID.randomUUID())
                .invoiceId(cmd.invoiceId())
                .supplierId(cmd.supplierId())
                .storeId(cmd.storeId())
                .supplierName(cmd.supplierName())
                .totalAmount(cmd.totalAmount())
                .itemCount(cmd.itemCount())
                .receivedAt(cmd.receivedAt())
                .recordedAt(Instant.now())
                .build();
        repository.save(fact);
    }
}
