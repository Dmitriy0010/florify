package ru.florify.inventory.adapter.out.persistence.mapper;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.inventory.adapter.out.persistence.entity.StockBatchJpaEntity;
import ru.florify.inventory.domain.model.StockBatch;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:58+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class StockBatchMapperImpl implements StockBatchMapper {

    @Override
    public StockBatch toDomain(StockBatchJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        StockBatch.StockBatchBuilder stockBatch = StockBatch.builder();

        stockBatch.expiresAt( entity.getExpiresAt() );
        stockBatch.id( entity.getId() );
        stockBatch.productId( entity.getProductId() );
        stockBatch.quantityReceived( entity.getQuantityReceived() );
        stockBatch.quantityRemaining( entity.getQuantityRemaining() );
        stockBatch.receivedAt( entity.getReceivedAt() );
        stockBatch.sourceDocumentId( entity.getSourceDocumentId() );
        stockBatch.status( entity.getStatus() );
        stockBatch.storeId( entity.getStoreId() );
        stockBatch.supplierId( entity.getSupplierId() );
        stockBatch.unitCost( entity.getUnitCost() );

        return stockBatch.build();
    }

    @Override
    public StockBatchJpaEntity toEntity(StockBatch domain) {
        if ( domain == null ) {
            return null;
        }

        StockBatchJpaEntity.StockBatchJpaEntityBuilder stockBatchJpaEntity = StockBatchJpaEntity.builder();

        stockBatchJpaEntity.expiresAt( domain.getExpiresAt() );
        stockBatchJpaEntity.id( domain.getId() );
        stockBatchJpaEntity.productId( domain.getProductId() );
        stockBatchJpaEntity.quantityReceived( domain.getQuantityReceived() );
        stockBatchJpaEntity.quantityRemaining( domain.getQuantityRemaining() );
        stockBatchJpaEntity.receivedAt( domain.getReceivedAt() );
        stockBatchJpaEntity.sourceDocumentId( domain.getSourceDocumentId() );
        stockBatchJpaEntity.status( domain.getStatus() );
        stockBatchJpaEntity.storeId( domain.getStoreId() );
        stockBatchJpaEntity.supplierId( domain.getSupplierId() );
        stockBatchJpaEntity.unitCost( domain.getUnitCost() );

        return stockBatchJpaEntity.build();
    }

    @Override
    public List<StockBatch> toDomainList(List<StockBatchJpaEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<StockBatch> list = new ArrayList<StockBatch>( entities.size() );
        for ( StockBatchJpaEntity stockBatchJpaEntity : entities ) {
            list.add( toDomain( stockBatchJpaEntity ) );
        }

        return list;
    }

    @Override
    public List<StockBatchJpaEntity> toEntityList(List<StockBatch> domains) {
        if ( domains == null ) {
            return null;
        }

        List<StockBatchJpaEntity> list = new ArrayList<StockBatchJpaEntity>( domains.size() );
        for ( StockBatch stockBatch : domains ) {
            list.add( toEntity( stockBatch ) );
        }

        return list;
    }
}
