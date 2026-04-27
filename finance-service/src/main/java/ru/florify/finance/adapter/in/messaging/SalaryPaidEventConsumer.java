package ru.florify.finance.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.event.SalaryPaidEvent;
import ru.florify.finance.application.command.RecordTransactionCommand;
import ru.florify.finance.application.port.in.RecordTransactionUseCase;
import ru.florify.finance.domain.model.FinancialType;

/**
 * Фиксирует расходы на заработную плату.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SalaryPaidEventConsumer {

    private final RecordTransactionUseCase recordTransactionUseCase;

    @Async
    @EventListener
    @Transactional
    public void onSalaryPaid(SalaryPaidEvent event) {
        log.info("Processing SalaryPaidEvent for statement {}", event.statementId());

        recordTransactionUseCase.execute(new RecordTransactionCommand(
                FinancialType.SALARY_EXPENSE,
                event.totalPayout().negate(), // Выплата - расход
                event.statementId(),
                "Salary payout for period " + event.period(),
                null,
                event.paidAt()
        ));
    }
}
