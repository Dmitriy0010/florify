package ru.florify.analytics.application.port.out;

import ru.florify.analytics.domain.model.PurchaseFact;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public interface PurchaseFactRepository {
    void save(PurchaseFact fact);
    boolean existsByInvoiceId(UUID invoiceId);
    BigDecimal sumPurchasesForPnl(LocalDate from, LocalDate to);
}
