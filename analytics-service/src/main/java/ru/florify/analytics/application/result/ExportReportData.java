package ru.florify.analytics.application.result;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExportReportData(
    ru.florify.analytics.domain.enums.ReportType reportType,
    LocalDate from,
    LocalDate to,
    SalesReportResult salesData,          // not null if reportType = SALES
    InventoryStatsResult inventoryData,   // not null if reportType = INVENTORY
    PnlData pnlData                       // not null if reportType = PNL
) {
    public record PnlData(
        BigDecimal totalRevenue,
        BigDecimal totalCogs,
        BigDecimal grossProfit,
        BigDecimal totalPurchases,
        BigDecimal totalSalaries,
        BigDecimal netProfit
    ) {}
}
