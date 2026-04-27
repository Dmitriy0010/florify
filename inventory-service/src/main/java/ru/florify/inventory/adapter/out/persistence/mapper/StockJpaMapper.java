package ru.florify.inventory.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import ru.florify.inventory.adapter.out.persistence.entity.StockBalanceJpaEntity;
import ru.florify.inventory.adapter.out.persistence.entity.StockTransactionJpaEntity;
import ru.florify.inventory.domain.model.StockBalance;
import ru.florify.inventory.domain.model.StockTransaction;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StockJpaMapper {

    StockBalance toDomain(StockBalanceJpaEntity entity);

    StockBalanceJpaEntity toEntity(StockBalance domain);

    StockTransaction toDomain(StockTransactionJpaEntity entity);

    StockTransactionJpaEntity toEntity(StockTransaction domain);
}
