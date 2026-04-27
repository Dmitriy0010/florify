package ru.florify.finance.domain.model;

import lombok.Builder;
import java.math.BigDecimal;
import java.time.YearMonth;

/**
 * Отчет о прибылях и убытках (Profit and Loss Statement).
 */
@Builder
public record PnlReport(
        YearMonth period,
        BigDecimal revenue,
        BigDecimal cogs,
        BigDecimal grossProfit,
        BigDecimal operatingExpenses,
        BigDecimal writeOffLosses,
        BigDecimal netProfit
) {
}
