package ru.florify.finance.adapter.out.persistence;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.finance.domain.model.FinancialTransaction;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:35+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class FinancialTransactionPersistenceMapperImpl implements FinancialTransactionPersistenceMapper {

    @Override
    public FinancialTransactionJpaEntity toEntity(FinancialTransaction domain) {
        if ( domain == null ) {
            return null;
        }

        FinancialTransactionJpaEntity.FinancialTransactionJpaEntityBuilder financialTransactionJpaEntity = FinancialTransactionJpaEntity.builder();

        financialTransactionJpaEntity.amount( domain.getAmount() );
        financialTransactionJpaEntity.description( domain.getDescription() );
        financialTransactionJpaEntity.id( domain.getId() );
        financialTransactionJpaEntity.occurredAt( domain.getOccurredAt() );
        financialTransactionJpaEntity.performedBy( domain.getPerformedBy() );
        financialTransactionJpaEntity.referenceId( domain.getReferenceId() );
        financialTransactionJpaEntity.type( domain.getType() );

        return financialTransactionJpaEntity.build();
    }

    @Override
    public FinancialTransaction toDomain(FinancialTransactionJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        FinancialTransaction.FinancialTransactionBuilder financialTransaction = FinancialTransaction.builder();

        financialTransaction.amount( entity.getAmount() );
        financialTransaction.description( entity.getDescription() );
        financialTransaction.id( entity.getId() );
        financialTransaction.occurredAt( entity.getOccurredAt() );
        financialTransaction.performedBy( entity.getPerformedBy() );
        financialTransaction.referenceId( entity.getReferenceId() );
        financialTransaction.type( entity.getType() );

        return financialTransaction.build();
    }
}
