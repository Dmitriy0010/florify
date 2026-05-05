package ru.florify.employee.adapter.out.persistence.mapper;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.employee.adapter.out.persistence.entity.SalaryStatementJpaEntity;
import ru.florify.employee.domain.model.SalaryStatement;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:40+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class SalaryStatementPersistenceMapperImpl implements SalaryStatementPersistenceMapper {

    @Override
    public SalaryStatementJpaEntity toEntity(SalaryStatement statement) {
        if ( statement == null ) {
            return null;
        }

        SalaryStatementJpaEntity.SalaryStatementJpaEntityBuilder salaryStatementJpaEntity = SalaryStatementJpaEntity.builder();

        salaryStatementJpaEntity.approvedBy( statement.getApprovedBy() );
        salaryStatementJpaEntity.baseSalary( statement.getBaseSalary() );
        salaryStatementJpaEntity.deductions( statement.getDeductions() );
        salaryStatementJpaEntity.employeeId( statement.getEmployeeId() );
        salaryStatementJpaEntity.id( statement.getId() );
        salaryStatementJpaEntity.manualBonus( statement.getManualBonus() );
        salaryStatementJpaEntity.orderBonus( statement.getOrderBonus() );
        salaryStatementJpaEntity.paidAt( statement.getPaidAt() );
        salaryStatementJpaEntity.salesBonus( statement.getSalesBonus() );
        salaryStatementJpaEntity.status( statement.getStatus() );
        salaryStatementJpaEntity.storeId( statement.getStoreId() );
        salaryStatementJpaEntity.totalPayout( statement.getTotalPayout() );

        salaryStatementJpaEntity.period( toString(statement.getPeriod()) );

        return salaryStatementJpaEntity.build();
    }

    @Override
    public SalaryStatement toDomain(SalaryStatementJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        SalaryStatement.SalaryStatementBuilder salaryStatement = SalaryStatement.builder();

        salaryStatement.approvedBy( entity.getApprovedBy() );
        salaryStatement.baseSalary( entity.getBaseSalary() );
        salaryStatement.deductions( entity.getDeductions() );
        salaryStatement.employeeId( entity.getEmployeeId() );
        salaryStatement.id( entity.getId() );
        salaryStatement.manualBonus( entity.getManualBonus() );
        salaryStatement.orderBonus( entity.getOrderBonus() );
        salaryStatement.paidAt( entity.getPaidAt() );
        salaryStatement.salesBonus( entity.getSalesBonus() );
        salaryStatement.status( entity.getStatus() );
        salaryStatement.storeId( entity.getStoreId() );
        salaryStatement.totalPayout( entity.getTotalPayout() );

        salaryStatement.period( toYearMonth(entity.getPeriod()) );

        return salaryStatement.build();
    }
}
