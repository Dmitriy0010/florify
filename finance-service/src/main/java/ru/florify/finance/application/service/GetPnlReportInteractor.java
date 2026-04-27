package ru.florify.finance.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.finance.application.port.in.GetPnlReportUseCase;
import ru.florify.finance.application.port.out.PnlLookupPort;
import ru.florify.finance.domain.model.FinancialType;
import ru.florify.finance.domain.model.PnlReport;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GetPnlReportInteractor implements GetPnlReportUseCase {

    private final PnlLookupPort pnlLookupPort;

    @Override
    @Transactional(readOnly = true)
    public PnlReport execute(Instant from, Instant to) {
        Map<FinancialType, BigDecimal> summary = pnlLookupPort.aggregateTransactions(from, to);

        BigDecimal revenue = summary.getOrDefault(FinancialType.REVENUE_SALE, BigDecimal.ZERO);
        BigDecimal cogs = summary.getOrDefault(FinancialType.COGS, BigDecimal.ZERO).abs(); // COGS в отчете обычно положительный
        BigDecimal grossProfit = revenue.subtract(cogs);

        BigDecimal salary = summary.getOrDefault(FinancialType.SALARY_EXPENSE, BigDecimal.ZERO).abs();
        BigDecimal purchase = summary.getOrDefault(FinancialType.PURCHASE_EXPENSE, BigDecimal.ZERO).abs();
        BigDecimal rent = summary.getOrDefault(FinancialType.RENT_EXPENSE, BigDecimal.ZERO).abs();
        BigDecimal marketing = summary.getOrDefault(FinancialType.MARKETING_EXPENSE, BigDecimal.ZERO).abs();
        BigDecimal other = summary.getOrDefault(FinancialType.OTHER_EXPENSE, BigDecimal.ZERO).abs();
        
        BigDecimal operatingExpenses = salary.add(purchase).add(rent).add(marketing).add(other);
        
        BigDecimal writeOffs = summary.getOrDefault(FinancialType.WRITE_OFF_EXPENSE, BigDecimal.ZERO).abs();
        
        BigDecimal netProfit = grossProfit.subtract(operatingExpenses).subtract(writeOffs);

        return PnlReport.builder()
                .period(YearMonth.from(from.atZone(ZoneId.systemDefault())))
                .revenue(revenue)
                .cogs(cogs)
                .grossProfit(grossProfit)
                .operatingExpenses(operatingExpenses)
                .writeOffLosses(writeOffs)
                .netProfit(netProfit)
                .build();
    }
}
