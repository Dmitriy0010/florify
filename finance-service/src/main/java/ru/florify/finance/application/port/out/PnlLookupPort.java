package ru.florify.finance.application.port.out;

import ru.florify.finance.domain.model.FinancialType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

public interface PnlLookupPort {
    Map<FinancialType, BigDecimal> aggregateTransactions(Instant from, Instant to);
}
