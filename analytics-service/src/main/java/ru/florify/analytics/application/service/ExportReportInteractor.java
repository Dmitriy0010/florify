package ru.florify.analytics.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.application.port.in.ExportReportUseCase;
import ru.florify.analytics.application.port.out.OrderFactRepository;
import ru.florify.analytics.application.port.out.PurchaseFactRepository;
import ru.florify.analytics.application.port.out.ReportExportPort;
import ru.florify.analytics.application.port.out.SalaryFactRepository;
import ru.florify.analytics.application.query.ExportReportQuery;
import ru.florify.analytics.application.result.ExportReportData;
import ru.florify.analytics.application.result.SalesReportResult;
import ru.florify.analytics.domain.enums.GroupByPeriod;
import ru.florify.analytics.domain.enums.ReportType;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ExportReportInteractor implements ExportReportUseCase {
    private final OrderFactRepository orderRepository;
    private final PurchaseFactRepository purchaseRepository;
    private final SalaryFactRepository salaryRepository;
    private final ReportExportPort exportPort;

    @Override
    @Transactional(readOnly = true)
    public byte[] exportReport(ExportReportQuery query) {
        ExportReportData data = switch (query.reportType()) {
            case SALES -> {
                SalesReportResult sales = orderRepository.aggregateSalesReport(query.from(), query.to(), GroupByPeriod.DAY);
                yield new ExportReportData(ReportType.SALES, query.from(), query.to(), sales, null, null);
            }
            case PNL -> {
                SalesReportResult sales = orderRepository.aggregateSalesReport(query.from(), query.to(), GroupByPeriod.MONTH);
                BigDecimal totalRevenue = sales.points().stream().map(SalesReportResult.SalesDataPoint::revenue).reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal totalGrossProfit = sales.points().stream().map(SalesReportResult.SalesDataPoint::grossProfit).reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal totalCogs = totalRevenue.subtract(totalGrossProfit);
                
                BigDecimal totalPurchases = purchaseRepository.sumPurchasesForPnl(query.from(), query.to());
                BigDecimal totalSalaries = salaryRepository.sumSalariesForPnl(query.from(), query.to());
                
                ExportReportData.PnlData pnl = new ExportReportData.PnlData(
                    totalRevenue, totalCogs, totalGrossProfit,
                    totalPurchases, totalSalaries, totalGrossProfit.subtract(totalPurchases).subtract(totalSalaries)
                );
                yield new ExportReportData(ReportType.PNL, query.from(), query.to(), null, null, pnl);
            }
            case INVENTORY -> new ExportReportData(ReportType.INVENTORY, query.from(), query.to(), null, null, null); // Simplified
        };

        return exportPort.generateExcel(data);
    }
}
