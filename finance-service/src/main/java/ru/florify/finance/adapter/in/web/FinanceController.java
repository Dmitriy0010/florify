package ru.florify.finance.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import ru.florify.finance.adapter.in.web.dto.PnlReportResponse;
import ru.florify.finance.application.port.out.FinancialTransactionRepository;
import ru.florify.finance.application.port.in.GetPnlReportUseCase;
import ru.florify.finance.domain.model.FinancialTransaction;
import ru.florify.finance.domain.model.PnlReport;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/finance")
@RequiredArgsConstructor
@Tag(name = "Finance", description = "Управление финансами и отчетность")
public class FinanceController {

    private final GetPnlReportUseCase getPnlReportUseCase;
    private final FinancialTransactionRepository transactionRepository;

    @GetMapping("/pnl")
    @Operation(summary = "Получить отчет о прибылях и убытках за период")
    public PnlReportResponse getPnlReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        Instant start = from.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant end = to.atTime(23, 59, 59).toInstant(ZoneOffset.UTC);

        PnlReport report = getPnlReportUseCase.execute(start, end);

        return PnlReportResponse.builder()
                .period(report.period())
                .revenue(report.revenue())
                .cogs(report.cogs())
                .grossProfit(report.grossProfit())
                .operatingExpenses(report.operatingExpenses())
                .writeOffLosses(report.writeOffLosses())
                .netProfit(report.netProfit())
                .build();
    }

    @GetMapping("/transactions")
    @Operation(summary = "Получить историю финансовых операций")
    public Page<TransactionResponse> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return transactionRepository.findAll(PageRequest.of(page, size, Sort.by("occurredAt").descending()))
                .map(t -> new TransactionResponse(
                        t.getId(),
                        t.getType().name(),
                        t.getAmount(),
                        t.getReferenceId(),
                        t.getDescription(),
                        t.getPerformedBy(),
                        t.getOccurredAt()
                ));
    }

    public record TransactionResponse(
            UUID id,
            String type,
            BigDecimal amount,
            UUID referenceId,
            String description,
            UUID performedBy,
            Instant occurredAt
    ) {}
}
