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

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

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
                    if (data.inventoryData() != null) {
                        Row invRow = sheet.createRow(currentRow++);
                        invRow.createCell(0).setCellValue("Total Write-off Amount:");
                        invRow.createCell(1).setCellValue(data.inventoryData().writeoffAmountMonth() != null ? data.inventoryData().writeoffAmountMonth().doubleValue() : 0.0);
                    } else {
                        Row invRow = sheet.createRow(currentRow++);
                        invRow.createCell(0).setCellValue("Inventory data currently empty.");
                    }
                }
            }
            
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }

    @Override
    public byte[] generatePdf(ExportReportData data) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font headerFont = new Font(Font.HELVETICA, 16, Font.BOLD);
            document.add(new Paragraph("Analytics Report: " + data.reportType(), headerFont));
            document.add(new Paragraph("Period: " + data.from() + " to " + data.to()));
            document.add(new Paragraph(" "));

            switch (data.reportType()) {
                case SALES -> {
                    if (data.salesData() != null) {
                        PdfPTable table = new PdfPTable(4);
                        table.addCell("Date");
                        table.addCell("Orders");
                        table.addCell("Revenue");
                        table.addCell("Profit");

                        for (SalesReportResult.SalesDataPoint point : data.salesData().points()) {
                            table.addCell(point.period().toString());
                            table.addCell(String.valueOf(point.ordersCount()));
                            table.addCell(point.revenue().toString());
                            table.addCell(point.grossProfit().toString());
                        }
                        document.add(table);
                    }
                }
                case PNL -> {
                    if (data.pnlData() != null) {
                        PdfPTable table = new PdfPTable(2);
                        table.addCell("Metric");
                        table.addCell("Value");
                        
                        table.addCell("Total Revenue");
                        table.addCell(data.pnlData().totalRevenue().toString());
                        
                        table.addCell("Total COGS");
                        table.addCell(data.pnlData().totalCogs().toString());
                        
                        table.addCell("Gross Profit");
                        table.addCell(data.pnlData().grossProfit().toString());
                        
                        document.add(table);
                    }
                }
                case INVENTORY -> {
                    if (data.inventoryData() != null) {
                        PdfPTable table = new PdfPTable(2);
                        table.addCell("Metric");
                        table.addCell("Value");
                        
                        table.addCell("Total Write-off Amount");
                        table.addCell(data.inventoryData().writeoffAmountMonth() != null ? data.inventoryData().writeoffAmountMonth().toString() : "0.00");
                        
                        document.add(table);
                    } else {
                        document.add(new Paragraph("Inventory data currently empty."));
                    }
                }
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }
}
