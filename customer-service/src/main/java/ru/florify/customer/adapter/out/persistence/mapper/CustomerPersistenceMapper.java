package ru.florify.customer.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.customer.adapter.out.persistence.entity.CustomerJpaEntity;
import ru.florify.customer.domain.model.Customer;

@Mapper(componentModel = "spring")
public interface CustomerPersistenceMapper {

    Customer toDomain(CustomerJpaEntity entity);

    @Mapping(target = "id", source = "customer.id")
    CustomerJpaEntity toJpaEntity(Customer customer);
}
