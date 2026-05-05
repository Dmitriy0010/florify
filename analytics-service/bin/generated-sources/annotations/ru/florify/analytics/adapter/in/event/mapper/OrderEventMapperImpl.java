package ru.florify.analytics.adapter.in.event.mapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.analytics.application.command.ApplyCogsToOrderFactCommand;
import ru.florify.analytics.application.command.CancelOrderFactCommand;
import ru.florify.analytics.application.command.RecordOrderFactCommand;
import ru.florify.analytics.domain.enums.OrderSource;
import ru.florify.common.event.OrderCancelledSpringEvent;
import ru.florify.common.event.OrderCogsCalculatedSpringEvent;
import ru.florify.common.event.OrderCompletedSpringEvent;
import ru.florify.common.event.OrderCreatedEvent;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:47+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class OrderEventMapperImpl implements OrderEventMapper {

    @Override
    public RecordOrderFactCommand toRecordCommand(OrderCompletedSpringEvent event) {
        if ( event == null ) {
            return null;
        }

        BigDecimal totalAmount = null;
        Instant completedAt = null;
        UUID storeId = null;
        UUID orderId = null;
        UUID customerId = null;

        totalAmount = event.finalAmount();
        completedAt = event.occurredAt();
        storeId = event.storeId();
        orderId = event.orderId();
        customerId = event.customerId();

        UUID assignedEmployeeId = null;
        OrderSource orderSource = OrderSource.WEB;
        Integer itemCount = 0;
        String status = null;

        RecordOrderFactCommand recordOrderFactCommand = new RecordOrderFactCommand( orderId, storeId, customerId, assignedEmployeeId, orderSource, status, totalAmount, itemCount, completedAt );

        return recordOrderFactCommand;
    }

    @Override
    public RecordOrderFactCommand fromCreated(OrderCreatedEvent event) {
        if ( event == null ) {
            return null;
        }

        Instant completedAt = null;
        OrderSource orderSource = null;
        Integer itemCount = null;
        UUID storeId = null;
        UUID orderId = null;
        UUID customerId = null;
        BigDecimal totalAmount = null;

        completedAt = event.occurredAt();
        if ( event.orderSource() != null ) {
            orderSource = Enum.valueOf( OrderSource.class, event.orderSource() );
        }
        itemCount = event.itemCount();
        storeId = event.storeId();
        orderId = event.orderId();
        customerId = event.customerId();
        totalAmount = event.totalAmount();

        UUID assignedEmployeeId = null;
        String status = "NEW";

        RecordOrderFactCommand recordOrderFactCommand = new RecordOrderFactCommand( orderId, storeId, customerId, assignedEmployeeId, orderSource, status, totalAmount, itemCount, completedAt );

        return recordOrderFactCommand;
    }

    @Override
    public CancelOrderFactCommand toCancelCommand(OrderCancelledSpringEvent event) {
        if ( event == null ) {
            return null;
        }

        Instant cancelledAt = null;
        UUID orderId = null;

        cancelledAt = event.occurredAt();
        orderId = event.orderId();

        String cancellationReason = "cancelled";

        CancelOrderFactCommand cancelOrderFactCommand = new CancelOrderFactCommand( orderId, cancellationReason, cancelledAt );

        return cancelOrderFactCommand;
    }

    @Override
    public ApplyCogsToOrderFactCommand toCogsCommand(OrderCogsCalculatedSpringEvent event) {
        if ( event == null ) {
            return null;
        }

        BigDecimal cogsAmount = null;
        UUID orderId = null;

        cogsAmount = event.totalCogs();
        orderId = event.orderId();

        ApplyCogsToOrderFactCommand applyCogsToOrderFactCommand = new ApplyCogsToOrderFactCommand( orderId, cogsAmount );

        return applyCogsToOrderFactCommand;
    }
}
