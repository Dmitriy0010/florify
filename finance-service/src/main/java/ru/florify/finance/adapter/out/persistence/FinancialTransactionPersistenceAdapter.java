package ru.florify.finance.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import ru.florify.finance.application.port.out.FinancialTransactionRepository;
import ru.florify.finance.domain.model.FinancialTransaction;
import ru.florify.finance.domain.model.FinancialType;

@Component
@RequiredArgsConstructor
public class FinancialTransactionPersistenceAdapter implements FinancialTransactionRepository, ru.florify.finance.application.port.out.PnlLookupPort {

    private final FinancialTransactionJpaRepository repository;
    private final FinancialTransactionPersistenceMapper mapper;

    @Override
    public void save(FinancialTransaction transaction) {
        repository.save(mapper.toEntity(transaction));
    }

    @Override
    public Page<FinancialTransaction> findAll(Pageable pageable) {
        return repository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public java.util.Map<FinancialType, java.math.BigDecimal> aggregateTransactions(java.time.Instant from, java.time.Instant to) {
        return repository.getSummary(from, to);
    }
}
