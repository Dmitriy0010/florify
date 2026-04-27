package ru.florify.analytics.adapter.in.event;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.adapter.in.event.mapper.FinanceEventMapper;
import ru.florify.analytics.application.port.in.RecordPurchaseFactUseCase;
import ru.florify.analytics.application.port.in.RecordSalaryFactUseCase;
import ru.florify.common.event.InvoiceReceivedSpringEvent;
import ru.florify.common.event.SalaryPaidEvent;

@Component
@RequiredArgsConstructor
public class FinanceEventListener {
    private final RecordPurchaseFactUseCase recordPurchaseFactUseCase;
    private final RecordSalaryFactUseCase recordSalaryFactUseCase;
    private final FinanceEventMapper mapper;

    @Async
    @EventListener
    @Transactional
    public void onInvoiceReceived(InvoiceReceivedSpringEvent event) {
        recordPurchaseFactUseCase.record(mapper.toPurchaseCommand(event));
    }

    @Async
    @EventListener
    @Transactional
    public void onSalaryPaid(SalaryPaidEvent event) {
        recordSalaryFactUseCase.record(mapper.toSalaryCommand(event));
    }
}
