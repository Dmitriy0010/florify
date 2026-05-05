package ru.florify.employee.adapter.out.persistence.mapper;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.employee.adapter.out.persistence.entity.SalaryConfigJpaEntity;
import ru.florify.employee.domain.model.SalaryConfig;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:39+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class SalaryConfigPersistenceMapperImpl implements SalaryConfigPersistenceMapper {

    @Override
    public SalaryConfigJpaEntity toEntity(SalaryConfig config) {
        if ( config == null ) {
            return null;
        }

        SalaryConfigJpaEntity.SalaryConfigJpaEntityBuilder salaryConfigJpaEntity = SalaryConfigJpaEntity.builder();

        salaryConfigJpaEntity.baseAmount( config.getBaseAmount() );
        salaryConfigJpaEntity.bonusPerOrder( config.getBonusPerOrder() );
        salaryConfigJpaEntity.employeeId( config.getEmployeeId() );
        salaryConfigJpaEntity.id( config.getId() );
        salaryConfigJpaEntity.salesPercent( config.getSalesPercent() );
        salaryConfigJpaEntity.type( config.getType() );
        salaryConfigJpaEntity.validFrom( config.getValidFrom() );

        return salaryConfigJpaEntity.build();
    }

    @Override
    public SalaryConfig toDomain(SalaryConfigJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        SalaryConfig.SalaryConfigBuilder salaryConfig = SalaryConfig.builder();

        salaryConfig.baseAmount( entity.getBaseAmount() );
        salaryConfig.bonusPerOrder( entity.getBonusPerOrder() );
        salaryConfig.employeeId( entity.getEmployeeId() );
        salaryConfig.id( entity.getId() );
        salaryConfig.salesPercent( entity.getSalesPercent() );
        salaryConfig.type( entity.getType() );
        salaryConfig.validFrom( entity.getValidFrom() );

        return salaryConfig.build();
    }
}
