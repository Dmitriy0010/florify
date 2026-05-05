package ru.florify.inventory.adapter.out.persistence.mapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.inventory.adapter.out.persistence.entity.StockBalanceJpaEntity;
import ru.florify.inventory.adapter.out.persistence.entity.StockTransactionJpaEntity;
import ru.florify.inventory.domain.model.StockBalance;
import ru.florify.inventory.domain.model.StockTransaction;
import ru.florify.inventory.domain.model.TransactionType;
import ru.florify.inventory.domain.model.WriteOffReason;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:57+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class StockJpaMapperImpl implements StockJpaMapper {

    @Override
    public StockBalance toDomain(StockBalanceJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        StockBalance.StockBalanceBuilder stockBalance = StockBalance.builder();

        stockBalance.averageCost( entity.getAverageCost() );
        stockBalance.id( entity.getId() );
        stockBalance.productId( entity.getProductId() );
        stockBalance.quantityInStock( entity.getQuantityInStock() );
        stockBalance.storeId( entity.getStoreId() );

        return stockBalance.build();
    }

    @Override
    public StockBalanceJpaEntity toEntity(StockBalance domain) {
        if ( domain == null ) {
            return null;
        }

        StockBalanceJpaEntity.StockBalanceJpaEntityBuilder stockBalanceJpaEntity = StockBalanceJpaEntity.builder();

        stockBalanceJpaEntity.averageCost( domain.getAverageCost() );
        stockBalanceJpaEntity.id( domain.getId() );
        stockBalanceJpaEntity.productId( domain.getProductId() );
        stockBalanceJpaEntity.quantityInStock( domain.getQuantityInStock() );
        stockBalanceJpaEntity.storeId( domain.getStoreId() );

        return stockBalanceJpaEntity.build();
    }

    @Override
    public StockTransaction toDomain(StockTransactionJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        UUID id = null;
        UUID productId = null;
        UUID storeId = null;
        TransactionType type = null;
        BigDecimal quantity = null;
        BigDecimal costBasis = null;
        BigDecimal totalValue = null;
        WriteOffReason writeOffReason = null;
        String comment = null;
        String sourceDocumentId = null;
        UUID performerId = null;
        Instant createdAt = null;

        id = entity.getId();
        productId = entity.getProductId();
        storeId = entity.getStoreId();
        type = entity.getType();
        quantity = entity.getQuantity();
        costBasis = entity.getCostBasis();
        totalValue = entity.getTotalValue();
        writeOffReason = entity.getWriteOffReason();
        comment = entity.getComment();
        sourceDocumentId = entity.getSourceDocumentId();
        performerId = entity.getPerformerId();
        createdAt = entity.getCreatedAt();

        StockTransaction stockTransaction = new StockTransaction( id, productId, storeId, type, quantity, costBasis, totalValue, writeOffReason, comment, sourceDocumentId, performerId, createdAt );

        return stockTransaction;
    }

    @Override
    public StockTransactionJpaEntity toEntity(StockTransaction domain) {
        if ( domain == null ) {
            return null;
        }

        StockTransactionJpaEntity.StockTransactionJpaEntityBuilder stockTransactionJpaEntity = StockTransactionJpaEntity.builder();

        stockTransactionJpaEntity.comment( domain.comment() );
        stockTransactionJpaEntity.costBasis( domain.costBasis() );
        stockTransactionJpaEntity.createdAt( domain.createdAt() );
        stockTransactionJpaEntity.id( domain.id() );
        stockTransactionJpaEntity.performerId( domain.performerId() );
        stockTransactionJpaEntity.productId( domain.productId() );
        stockTransactionJpaEntity.quantity( domain.quantity() );
        stockTransactionJpaEntity.sourceDocumentId( domain.sourceDocumentId() );
        stockTransactionJpaEntity.storeId( domain.storeId() );
        stockTransactionJpaEntity.totalValue( domain.totalValue() );
        stockTransactionJpaEntity.type( domain.type() );
        stockTransactionJpaEntity.writeOffReason( domain.writeOffReason() );

        return stockTransactionJpaEntity.build();
    }
}
