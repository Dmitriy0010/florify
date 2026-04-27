package ru.florify.finance.adapter.in.web.dto;

import lombok.Builder;
import java.math.BigDecimal;
import java.time.YearMonth;

@Builder
public record PnlReportResponse(
        YearMonth period,
        BigDecimal revenue,
        BigDecimal cogs,
        BigDecimal grossProfit,
        BigDecimal operatingExpenses,
        BigDecimal writeOffLosses,
        BigDecimal netProfit
) {
}
