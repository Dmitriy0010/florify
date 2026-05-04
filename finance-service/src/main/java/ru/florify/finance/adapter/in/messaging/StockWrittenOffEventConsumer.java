package ru.florify.finance.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.event.StockWrittenOffSpringEvent;
import ru.florify.finance.application.command.RecordTransactionCommand;
import ru.florify.finance.application.port.in.RecordTransactionUseCase;
import ru.florify.finance.domain.model.FinancialType;

/**
 * Фиксирует убытки от списания товара (порча, кража, инвентаризация).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StockWrittenOffEventConsumer {

    private final RecordTransactionUseCase recordTransactionUseCase;

    @Async
    @EventListener
    @Transactional
    public void onStockWrittenOff(StockWrittenOffSpringEvent event) {
        log.info("Processing StockWrittenOffSpringEvent for productId {}, reason: {}", 
                event.productId(), event.reason());

        // Мы не фиксируем COGS через этот слушатель, если это списание под заказ (это делает OrderCompletedEventConsumer)
        // Поэтому фильтруем по причине, если нужно, или фиксируем только потери INVENTORY_LOSS.
        // В текущей логике inventory-service под заказ списывает с причиной INVENTORY_LOSS (нужно уточнить).
        
        // Мы фиксируем убытки, которые НЕ являются продажей и НЕ являются инвентаризацией (у неё свой слушатель)
        if (!event.reason().contains("order") && !event.reason().contains("INVENTORY_LOSS")) {
            recordTransactionUseCase.execute(new RecordTransactionCommand(
                    FinancialType.WRITE_OFF_EXPENSE,
                    event.totalValue().negate(), // Убыток
                    event.sourceDocumentId(),
                    "Убыток от списания: " + event.reason(),
                    null,
                    event.occurredAt()
            ));
        }
    }
}
