package ru.florify.analytics.adapter.in.event.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.analytics.application.command.RecordPurchaseFactCommand;
import ru.florify.analytics.application.command.RecordSalaryFactCommand;
import ru.florify.common.event.InvoiceReceivedSpringEvent;
import ru.florify.common.event.SalaryPaidEvent;

import java.time.LocalDate;
import java.time.YearMonth;

@Mapper(componentModel = "spring")
public interface FinanceEventMapper {
    @Mapping(target = "receivedAt", source = "occurredAt")
    @Mapping(target = "itemCount", constant = "0")
    @Mapping(target = "supplierName", constant = "Unknown Supplier")
    @Mapping(target = "storeId", source = "storeId")
    RecordPurchaseFactCommand toPurchaseCommand(InvoiceReceivedSpringEvent event);

    @Mapping(target = "sourceEventId", source = "statementId")
    @Mapping(target = "amount", source = "totalPayout")
    @Mapping(target = "storeId", source = "storeId")
    @Mapping(target = "employeeName", constant = "Unknown Employee")
    @Mapping(target = "employeeRole", constant = "Unknown Role")
    @Mapping(target = "periodStart", expression = "java(toLocalDate(event.period(), true))")
    @Mapping(target = "periodEnd", expression = "java(toLocalDate(event.period(), false))")
    RecordSalaryFactCommand toSalaryCommand(SalaryPaidEvent event);

    default LocalDate toLocalDate(YearMonth period, boolean start) {
        if (period == null) return LocalDate.now();
        return start ? period.atDay(1) : period.atEndOfMonth();
    }
}
