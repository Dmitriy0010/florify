package ru.florify.analytics.adapter.in.event.mapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.analytics.application.command.RecordPurchaseFactCommand;
import ru.florify.analytics.application.command.RecordSalaryFactCommand;
import ru.florify.common.event.InvoiceReceivedSpringEvent;
import ru.florify.common.event.SalaryPaidEvent;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:47+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class FinanceEventMapperImpl implements FinanceEventMapper {

    @Override
    public RecordPurchaseFactCommand toPurchaseCommand(InvoiceReceivedSpringEvent event) {
        if ( event == null ) {
            return null;
        }

        Instant receivedAt = null;
        UUID storeId = null;
        UUID invoiceId = null;
        UUID supplierId = null;
        BigDecimal totalAmount = null;

        receivedAt = event.occurredAt();
        storeId = event.storeId();
        invoiceId = event.invoiceId();
        supplierId = event.supplierId();
        totalAmount = event.totalAmount();

        Integer itemCount = 0;
        String supplierName = "Unknown Supplier";

        RecordPurchaseFactCommand recordPurchaseFactCommand = new RecordPurchaseFactCommand( invoiceId, supplierId, storeId, supplierName, totalAmount, itemCount, receivedAt );

        return recordPurchaseFactCommand;
    }

    @Override
    public RecordSalaryFactCommand toSalaryCommand(SalaryPaidEvent event) {
        if ( event == null ) {
            return null;
        }

        UUID sourceEventId = null;
        BigDecimal amount = null;
        UUID storeId = null;
        UUID employeeId = null;
        Instant paidAt = null;

        sourceEventId = event.statementId();
        amount = event.totalPayout();
        storeId = event.storeId();
        employeeId = event.employeeId();
        paidAt = event.paidAt();

        String employeeName = "Unknown Employee";
        String employeeRole = "Unknown Role";
        LocalDate periodStart = toLocalDate(event.period(), true);
        LocalDate periodEnd = toLocalDate(event.period(), false);

        RecordSalaryFactCommand recordSalaryFactCommand = new RecordSalaryFactCommand( sourceEventId, employeeId, storeId, employeeName, employeeRole, amount, periodStart, periodEnd, paidAt );

        return recordSalaryFactCommand;
    }
}
