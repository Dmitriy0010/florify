package ru.florify.customer.adapter.out.persistence.mapper;

import java.time.Instant;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.customer.adapter.out.persistence.entity.LoyaltyAccountJpaEntity;
import ru.florify.customer.adapter.out.persistence.entity.LoyaltyTransactionJpaEntity;
import ru.florify.customer.domain.enums.LoyaltyTxType;
import ru.florify.customer.domain.model.LoyaltyAccount;
import ru.florify.customer.domain.model.LoyaltyTransaction;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:44+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class LoyaltyPersistenceMapperImpl implements LoyaltyPersistenceMapper {

    @Override
    public LoyaltyAccount toDomain(LoyaltyAccountJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        LoyaltyAccount.LoyaltyAccountBuilder loyaltyAccount = LoyaltyAccount.builder();

        loyaltyAccount.createdAt( entity.getCreatedAt() );
        loyaltyAccount.customerId( entity.getCustomerId() );
        loyaltyAccount.id( entity.getId() );
        loyaltyAccount.pointsBalance( entity.getPointsBalance() );
        loyaltyAccount.reservedPoints( entity.getReservedPoints() );
        loyaltyAccount.tier( entity.getTier() );
        loyaltyAccount.totalSpent( entity.getTotalSpent() );
        loyaltyAccount.updatedAt( entity.getUpdatedAt() );

        return loyaltyAccount.build();
    }

    @Override
    public LoyaltyAccountJpaEntity toJpaEntity(LoyaltyAccount domain) {
        if ( domain == null ) {
            return null;
        }

        LoyaltyAccountJpaEntity.LoyaltyAccountJpaEntityBuilder loyaltyAccountJpaEntity = LoyaltyAccountJpaEntity.builder();

        loyaltyAccountJpaEntity.createdAt( domain.getCreatedAt() );
        loyaltyAccountJpaEntity.customerId( domain.getCustomerId() );
        loyaltyAccountJpaEntity.id( domain.getId() );
        loyaltyAccountJpaEntity.pointsBalance( domain.getPointsBalance() );
        loyaltyAccountJpaEntity.reservedPoints( domain.getReservedPoints() );
        loyaltyAccountJpaEntity.tier( domain.getTier() );
        loyaltyAccountJpaEntity.totalSpent( domain.getTotalSpent() );
        loyaltyAccountJpaEntity.updatedAt( domain.getUpdatedAt() );

        return loyaltyAccountJpaEntity.build();
    }

    @Override
    public LoyaltyTransaction toDomain(LoyaltyTransactionJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        UUID id = null;
        UUID loyaltyAccountId = null;
        UUID orderId = null;
        LoyaltyTxType type = null;
        int points = 0;
        String description = null;
        Instant occurredAt = null;

        id = entity.getId();
        loyaltyAccountId = entity.getLoyaltyAccountId();
        orderId = entity.getOrderId();
        type = entity.getType();
        points = entity.getPoints();
        description = entity.getDescription();
        occurredAt = entity.getOccurredAt();

        LoyaltyTransaction loyaltyTransaction = new LoyaltyTransaction( id, loyaltyAccountId, orderId, type, points, description, occurredAt );

        return loyaltyTransaction;
    }

    @Override
    public LoyaltyTransactionJpaEntity toJpaEntity(LoyaltyTransaction domain) {
        if ( domain == null ) {
            return null;
        }

        LoyaltyTransactionJpaEntity.LoyaltyTransactionJpaEntityBuilder loyaltyTransactionJpaEntity = LoyaltyTransactionJpaEntity.builder();

        loyaltyTransactionJpaEntity.description( domain.description() );
        loyaltyTransactionJpaEntity.id( domain.id() );
        loyaltyTransactionJpaEntity.loyaltyAccountId( domain.loyaltyAccountId() );
        loyaltyTransactionJpaEntity.occurredAt( domain.occurredAt() );
        loyaltyTransactionJpaEntity.orderId( domain.orderId() );
        loyaltyTransactionJpaEntity.points( domain.points() );
        loyaltyTransactionJpaEntity.type( domain.type() );

        return loyaltyTransactionJpaEntity.build();
    }
}
