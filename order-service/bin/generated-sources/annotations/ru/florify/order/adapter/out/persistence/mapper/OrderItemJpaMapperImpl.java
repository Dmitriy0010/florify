package ru.florify.order.adapter.out.persistence.mapper;

import java.math.BigDecimal;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.order.adapter.out.persistence.entity.OrderItemJpaEntity;
import ru.florify.order.domain.model.OrderItem;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:52+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class OrderItemJpaMapperImpl implements OrderItemJpaMapper {

    @Override
    public OrderItemJpaEntity toEntity(OrderItem domain) {
        if ( domain == null ) {
            return null;
        }

        OrderItemJpaEntity.OrderItemJpaEntityBuilder orderItemJpaEntity = OrderItemJpaEntity.builder();

        orderItemJpaEntity.productId( domain.productId() );
        orderItemJpaEntity.productName( domain.productName() );
        orderItemJpaEntity.quantity( domain.quantity() );
        orderItemJpaEntity.unitPrice( domain.unitPrice() );

        orderItemJpaEntity.lineTotal( domain.lineTotal() );

        return orderItemJpaEntity.build();
    }

    @Override
    public OrderItem toDomain(OrderItemJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        UUID productId = null;
        String productName = null;
        BigDecimal quantity = null;
        BigDecimal unitPrice = null;
        BigDecimal lineTotal = null;

        productId = entity.getProductId();
        productName = entity.getProductName();
        quantity = entity.getQuantity();
        unitPrice = entity.getUnitPrice();
        lineTotal = entity.getLineTotal();

        OrderItem orderItem = new OrderItem( productId, productName, quantity, unitPrice, lineTotal );

        return orderItem;
    }
}
