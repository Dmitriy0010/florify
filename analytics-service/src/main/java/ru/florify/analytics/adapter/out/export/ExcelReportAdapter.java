package ru.florify.analytics.adapter.out.export;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import ru.florify.analytics.application.port.out.ReportExportPort;
import ru.florify.analytics.application.result.ExportReportData;
import ru.florify.analytics.application.result.SalesReportResult;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Component
public class ExcelReportAdapter implements ReportExportPort {

    @Override
    public byte[] generateExcel(ExportReportData data) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Report " + data.reportType());
            
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Report Type:");
            headerRow.createCell(1).setCellValue(data.reportType().toString());
            
            Row periodRow = sheet.createRow(1);
            periodRow.createCell(0).setCellValue("Period:");
            periodRow.createCell(1).setCellValue(data.from() + " - " + data.to());

            int currentRow = 3;
            switch (data.reportType()) {
                case SALES -> {
                    if (data.salesData() != null) {
                        Row salesHeader = sheet.createRow(currentRow++);
                        salesHeader.createCell(0).setCellValue("Date");
                        salesHeader.createCell(1).setCellValue("Orders");
                        salesHeader.createCell(2).setCellValue("Revenue");
                        salesHeader.createCell(3).setCellValue("Profit");
                        
                        for (SalesReportResult.SalesDataPoint point : data.salesData().points()) {
                            Row row = sheet.createRow(currentRow++);
                            row.createCell(0).setCellValue(point.period().toString());
                            row.createCell(1).setCellValue(point.ordersCount());
                            row.createCell(2).setCellValue(point.revenue().doubleValue());
                            row.createCell(3).setCellValue(point.grossProfit().doubleValue());
                        }
                    }
                }
                case PNL -> {
                    if (data.pnlData() != null) {
                        Row pnlRow = sheet.createRow(currentRow++);
                        pnlRow.createCell(0).setCellValue("Total Revenue:");
                        pnlRow.createCell(1).setCellValue(data.pnlData().totalRevenue().doubleValue());
                        
                        pnlRow = sheet.createRow(currentRow++);
                        pnlRow.createCell(0).setCellValue("Total COGS:");
                        pnlRow.createCell(1).setCellValue(data.pnlData().totalCogs().doubleValue());
                        
                        pnlRow = sheet.createRow(currentRow++);
                        pnlRow.createCell(0).setCellValue("Gross Profit:");
                        pnlRow.createCell(1).setCellValue(data.pnlData().grossProfit().doubleValue());
                    }
                }
                case INVENTORY -> {
                    // Placeholder
                }
            }
            
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }
}
