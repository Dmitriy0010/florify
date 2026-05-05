package ru.florify.order.adapter.out.persistence.mapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.order.adapter.out.persistence.repository.OrderKanbanProjection;
import ru.florify.order.domain.model.OrderKanbanItem;
import ru.florify.order.domain.model.OrderSource;
import ru.florify.order.domain.model.OrderType;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:53+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class OrderProjectionMapperImpl implements OrderProjectionMapper {

    @Override
    public OrderKanbanItem toDomain(OrderKanbanProjection projection) {
        if ( projection == null ) {
            return null;
        }

        UUID id = null;
        String orderNumber = null;
        String status = null;
        BigDecimal finalAmount = null;
        Instant createdAt = null;
        String guestName = null;
        String guestPhone = null;
        String floristName = null;
        Boolean isPaid = null;

        id = projection.getId();
        orderNumber = projection.getOrderNumber();
        status = projection.getStatus();
        finalAmount = projection.getFinalAmount();
        createdAt = projection.getCreatedAt();
        guestName = projection.getGuestName();
        guestPhone = projection.getGuestPhone();
        floristName = projection.getFloristName();
        isPaid = projection.getIsPaid();

        OrderType type = projection.getType() != null ? OrderType.valueOf(projection.getType()) : null;
        OrderSource source = projection.getSource() != null ? OrderSource.valueOf(projection.getSource()) : null;

        OrderKanbanItem orderKanbanItem = new OrderKanbanItem( id, orderNumber, status, finalAmount, createdAt, guestName, guestPhone, type, source, floristName, isPaid );

        return orderKanbanItem;
    }
}
