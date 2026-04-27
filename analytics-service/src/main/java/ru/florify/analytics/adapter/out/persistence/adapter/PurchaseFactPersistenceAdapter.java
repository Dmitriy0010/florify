package ru.florify.analytics.adapter.out.persistence.adapter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.analytics.adapter.out.persistence.entity.CostFactJpaEntity;
import ru.florify.analytics.adapter.out.persistence.entity.CostFactType;
import ru.florify.analytics.adapter.out.persistence.repository.CostFactJpaRepository;
import ru.florify.analytics.application.port.out.PurchaseFactRepository;
import ru.florify.analytics.domain.model.PurchaseFact;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PurchaseFactPersistenceAdapter implements PurchaseFactRepository {
    private final CostFactJpaRepository repository;

    @Override
    public void save(PurchaseFact fact) {
        repository.save(CostFactJpaEntity.builder()
                .id(fact.getId())
                .costType(CostFactType.PURCHASE)
                .sourceRefId(fact.getInvoiceId())
                .storeId(fact.getStoreId())
                .occurredAt(fact.getReceivedAt())
                .recordedAt(fact.getRecordedAt())
                .amount(fact.getTotalAmount())
                .supplierId(fact.getSupplierId())
                .supplierName(fact.getSupplierName())
                .itemCount(fact.getItemCount())
                .build());
    }

    @Override
    public boolean existsByInvoiceId(UUID invoiceId) {
        return repository.existsByCostTypeAndSourceRefId(CostFactType.PURCHASE, invoiceId);
    }

    @Override
    public BigDecimal sumPurchasesForPnl(LocalDate from, LocalDate to) {
        Instant fromInstant = from.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant toInstant = to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC).minusSeconds(1);
        return repository.sumAmountBetweenByType(CostFactType.PURCHASE, fromInstant, toInstant);
    }
}
