package ru.florify.inventory.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ru.florify.inventory.adapter.out.persistence.entity.StockBatchJpaEntity;
import ru.florify.inventory.domain.model.StockBatch;

import java.util.List;

@Mapper(componentModel = "spring")
public interface StockBatchMapper {
    StockBatch toDomain(StockBatchJpaEntity entity);
    StockBatchJpaEntity toEntity(StockBatch domain);
    List<StockBatch> toDomainList(List<StockBatchJpaEntity> entities);
    List<StockBatchJpaEntity> toEntityList(List<StockBatch> domains);
}
