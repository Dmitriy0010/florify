package ru.florify.employee.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.employee.adapter.out.persistence.entity.SalaryStatementJpaEntity;
import ru.florify.employee.domain.model.SalaryStatement;

import java.time.YearMonth;

@Mapper(componentModel = "spring")
public interface SalaryStatementPersistenceMapper {

    @Mapping(target = "period", expression = "java(toString(statement.getPeriod()))")
    SalaryStatementJpaEntity toEntity(SalaryStatement statement);

    @Mapping(target = "period", expression = "java(toYearMonth(entity.getPeriod()))")
    SalaryStatement toDomain(SalaryStatementJpaEntity entity);

    default String toString(YearMonth yearMonth) {
        return yearMonth == null ? null : yearMonth.toString();
    }

    default YearMonth toYearMonth(String value) {
        return value == null ? null : YearMonth.parse(value);
    }
}
