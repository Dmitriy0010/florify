package ru.florify.customer.adapter.in.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import ru.florify.common.event.OrderCreatedEvent;
import ru.florify.customer.application.command.ReservePointsCommand;
import ru.florify.customer.application.port.in.ReservePointsUseCase;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCreatedEventListener {

    private final ReservePointsUseCase reservePointsUseCase;

    /**
     * Internal listener for OrderCreatedEvent.
     * TransactionalEventListener ensures this runs after the order transaction is committed.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCreated(OrderCreatedEvent event) {
        log.info("Processing internal OrderCreatedEvent for order: {}", event.orderId());

        try {
            if (event.bonusPointsUsed() > 0) {
                reservePointsUseCase.execute(new ReservePointsCommand(
                    event.customerId(),
                    event.orderId(),
                    event.bonusPointsUsed()
                ));
            } else {
                log.debug("No points used in order {}. Skipping reservation.", event.orderId());
            }
        } catch (Exception e) {
            log.error("Failed to process OrderCreatedEvent for order: {}", event.orderId(), e);
        }
    }
}
