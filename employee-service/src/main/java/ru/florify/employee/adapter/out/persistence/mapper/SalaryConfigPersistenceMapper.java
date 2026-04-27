package ru.florify.employee.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ru.florify.employee.adapter.out.persistence.entity.SalaryConfigJpaEntity;
import ru.florify.employee.domain.model.SalaryConfig;

@Mapper(componentModel = "spring")
public interface SalaryConfigPersistenceMapper {
    SalaryConfigJpaEntity toEntity(SalaryConfig config);
    SalaryConfig toDomain(SalaryConfigJpaEntity entity);
}
