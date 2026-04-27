package ru.florify.finance.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.event.StockAdjustmentSpringEvent;
import ru.florify.finance.application.command.RecordTransactionCommand;
import ru.florify.finance.application.port.in.RecordTransactionUseCase;
import ru.florify.finance.domain.model.FinancialType;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryAdjustmentEventConsumer {

    private final RecordTransactionUseCase recordTransactionUseCase;

    @Async
    @EventListener
    @Transactional
    public void onStockAdjustment(StockAdjustmentSpringEvent event) {
        log.info("Processing StockAdjustmentSpringEvent: type={}, amount={}", event.type(), event.amount());

        FinancialType finType = event.type() == StockAdjustmentSpringEvent.AdjustmentType.SURPLUS 
                ? FinancialType.INVENTORY_GAIN 
                : FinancialType.INVENTORY_LOSS;

        // Для итогов: доход положительный, расход отрицательный
        java.math.BigDecimal finalAmount = event.type() == StockAdjustmentSpringEvent.AdjustmentType.SURPLUS 
                ? event.amount() 
                : event.amount().negate();

        recordTransactionUseCase.execute(new RecordTransactionCommand(
                finType,
                finalAmount,
                UUID.randomUUID(), // Adjustment session ID? We don't have it, so random
                "Inventory adjustment: " + event.sourceDocument(),
                null,
                event.occurredAt()
        ));
    }
}
