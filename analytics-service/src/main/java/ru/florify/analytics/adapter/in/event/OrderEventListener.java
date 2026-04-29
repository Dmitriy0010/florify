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
    public void onOrderCreated(ru.florify.common.event.OrderCreatedEvent event) {
        recordOrderFactUseCase.record(mapper.fromCreated(event));
    }

    @Async
    @EventListener
    @Transactional
    public void onOrderStatusChanged(ru.florify.common.event.OrderStatusChangedSpringEvent event) {
        // We only care about tracking status changes for existing facts
        // Build a minimal command or just use the mapper if it supports it
        // For simplicity, let's assume record() handles partial updates if we provide enough info
        // or we could add a dedicated UpdateOrderStatusFactUseCase.
        // Given current RecordOrderFactInteractor implementation, it updates status based on orderId.
        
        // We need a way to get storeId and other fields if we want to use record() properly for updates
        // but since record() uses findByOrderId, we can pass a command with just orderId and status.
        // Wait, the mapper for OrderCompletedSpringEvent already exists.
        
        // Let's create a mapper for OrderStatusChangedSpringEvent
        recordOrderFactUseCase.record(new ru.florify.analytics.application.command.RecordOrderFactCommand(
            event.orderId(),
            null, // storeId not available in this event, but record() uses it only for creation
            event.customerId(),
            null,
            null,
            event.newStatus(),
            null, 
            null,
            event.occurredAt()
        ));
    }

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
