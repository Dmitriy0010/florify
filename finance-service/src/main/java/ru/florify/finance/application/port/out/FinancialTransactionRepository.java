package ru.florify.finance.application.port.out;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ru.florify.finance.domain.model.FinancialTransaction;
import java.util.UUID;

public interface FinancialTransactionRepository {
    void save(FinancialTransaction transaction);
    Page<FinancialTransaction> findAll(Pageable pageable);
}
