package ru.florify.analytics.adapter.out.persistence.mapper;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.analytics.adapter.out.persistence.entity.OrderFactJpaEntity;
import ru.florify.analytics.domain.model.OrderFact;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:47+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class OrderFactPersistenceMapperImpl implements OrderFactPersistenceMapper {

    @Override
    public OrderFactJpaEntity toEntity(OrderFact domain) {
        if ( domain == null ) {
            return null;
        }

        OrderFactJpaEntity.OrderFactJpaEntityBuilder orderFactJpaEntity = OrderFactJpaEntity.builder();

        orderFactJpaEntity.storeId( domain.getStoreId() );
        orderFactJpaEntity.assignedEmployeeId( domain.getAssignedEmployeeId() );
        orderFactJpaEntity.cancellationReason( domain.getCancellationReason() );
        orderFactJpaEntity.cancelledAt( domain.getCancelledAt() );
        orderFactJpaEntity.cogsAmount( domain.getCogsAmount() );
        orderFactJpaEntity.completedAt( domain.getCompletedAt() );
        orderFactJpaEntity.customerId( domain.getCustomerId() );
        orderFactJpaEntity.grossProfit( domain.getGrossProfit() );
        orderFactJpaEntity.itemCount( domain.getItemCount() );
        orderFactJpaEntity.orderId( domain.getOrderId() );
        orderFactJpaEntity.orderSource( domain.getOrderSource() );
        orderFactJpaEntity.recordedAt( domain.getRecordedAt() );
        orderFactJpaEntity.status( domain.getStatus() );
        orderFactJpaEntity.totalAmount( domain.getTotalAmount() );

        return orderFactJpaEntity.build();
    }

    @Override
    public OrderFact toDomain(OrderFactJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        OrderFact.OrderFactBuilder orderFact = OrderFact.builder();

        orderFact.storeId( entity.getStoreId() );
        orderFact.assignedEmployeeId( entity.getAssignedEmployeeId() );
        orderFact.cancellationReason( entity.getCancellationReason() );
        orderFact.cancelledAt( entity.getCancelledAt() );
        orderFact.cogsAmount( entity.getCogsAmount() );
        orderFact.completedAt( entity.getCompletedAt() );
        orderFact.customerId( entity.getCustomerId() );
        orderFact.grossProfit( entity.getGrossProfit() );
        orderFact.itemCount( entity.getItemCount() );
        orderFact.orderId( entity.getOrderId() );
        orderFact.orderSource( entity.getOrderSource() );
        orderFact.recordedAt( entity.getRecordedAt() );
        orderFact.status( entity.getStatus() );
        orderFact.totalAmount( entity.getTotalAmount() );

        return orderFact.build();
    }
}
