package ru.florify.finance.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.event.OrderCompletedSpringEvent;
import ru.florify.finance.application.command.RecordTransactionCommand;
import ru.florify.finance.application.port.in.RecordTransactionUseCase;
import ru.florify.finance.domain.model.FinancialType;

import java.math.BigDecimal;

/**
 * Потребляет события завершения заказа и фиксирует выручку (Revenue).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FinanceOrderCompletedConsumer {

    private final RecordTransactionUseCase recordTransactionUseCase;

    @Async
    @EventListener
    @Transactional
    public void onOrderCompleted(OrderCompletedSpringEvent event) {
        log.info("Processing OrderCompletedSpringEvent for order {}", event.orderId());

        // 1. Фиксация Выручки (REVENUE_SALE)
        recordTransactionUseCase.execute(new RecordTransactionCommand(
                FinancialType.REVENUE_SALE,
                event.finalAmount(),
                event.orderId(),
                "Выручка по заказу #" + event.orderId(),
                null,
                event.occurredAt()
        ));

        // 2. Фиксация Себестоимости (COGS), если она передана
        if (event.totalCogs() != null && event.totalCogs().compareTo(BigDecimal.ZERO) > 0) {
            recordTransactionUseCase.execute(new RecordTransactionCommand(
                    FinancialType.COGS,
                    event.totalCogs().negate(), // Отрицательная сумма для COGS (убыток)
                    event.orderId(),
                    "Себестоимость заказа #" + event.orderId(),
                    null,
                    event.occurredAt()
            ));
        }
    }
}
