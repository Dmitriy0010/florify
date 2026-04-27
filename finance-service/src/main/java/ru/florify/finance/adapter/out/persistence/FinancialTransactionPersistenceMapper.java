package ru.florify.finance.adapter.out.persistence;

import org.mapstruct.Mapper;
import ru.florify.finance.domain.model.FinancialTransaction;

@Mapper(componentModel = "spring")
public interface FinancialTransactionPersistenceMapper {
    FinancialTransactionJpaEntity toEntity(FinancialTransaction domain);
    FinancialTransaction toDomain(FinancialTransactionJpaEntity entity);
}
