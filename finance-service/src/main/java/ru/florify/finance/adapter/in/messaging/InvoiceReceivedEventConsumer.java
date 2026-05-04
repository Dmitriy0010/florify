package ru.florify.finance.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.event.InvoiceReceivedSpringEvent;
import ru.florify.finance.application.command.RecordTransactionCommand;
import ru.florify.finance.application.port.in.RecordTransactionUseCase;
import ru.florify.finance.domain.model.FinancialType;

/**
 * Фиксирует расходы на закупку товара при получении накладной от поставщика.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InvoiceReceivedEventConsumer {

    private final RecordTransactionUseCase recordTransactionUseCase;

    @Async
    @EventListener
    @Transactional
    public void onInvoiceReceived(InvoiceReceivedSpringEvent event) {
        log.info("Processing InvoiceReceivedSpringEvent for invoice {}", event.invoiceId());

        recordTransactionUseCase.execute(new RecordTransactionCommand(
                FinancialType.PURCHASE_EXPENSE,
                event.totalAmount().negate(), // Трата - отрицательное значение
                event.invoiceId(),
                "Закупка у поставщика",
                null,
                event.occurredAt()
        ));
    }
}
