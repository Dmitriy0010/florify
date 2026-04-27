package ru.florify.analytics.adapter.in.event;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.adapter.in.event.mapper.OrderEventMapper;
import ru.florify.analytics.application.port.in.ApplyCogsToOrderFactUseCase;
import ru.florify.analytics.application.port.in.CancelOrderFactUseCase;
import ru.florify.analytics.application.port.in.RecordOrderFactUseCase;
import ru.florify.common.event.OrderCancelledSpringEvent;
import ru.florify.common.event.OrderCogsCalculatedSpringEvent;
import ru.florify.common.event.OrderCompletedSpringEvent;

@Component
@RequiredArgsConstructor
public class OrderEventListener {
    private final RecordOrderFactUseCase recordOrderFactUseCase;
    private final CancelOrderFactUseCase cancelOrderFactUseCase;
    private final ApplyCogsToOrderFactUseCase applyCogsToOrderFactUseCase;
    private final OrderEventMapper mapper;

    @Async
    @EventListener
    @Transactional
    public void onOrderCompleted(OrderCompletedSpringEvent event) {
        recordOrderFactUseCase.record(mapper.toRecordCommand(event));
    }

    @Async
    @EventListener
    @Transactional
    public void onOrderCancelled(OrderCancelledSpringEvent event) {
        cancelOrderFactUseCase.cancel(mapper.toCancelCommand(event));
    }

    @Async
    @EventListener
    @Transactional
    public void onCogsCalculated(OrderCogsCalculatedSpringEvent event) {
        applyCogsToOrderFactUseCase.apply(mapper.toCogsCommand(event));
    }
}
