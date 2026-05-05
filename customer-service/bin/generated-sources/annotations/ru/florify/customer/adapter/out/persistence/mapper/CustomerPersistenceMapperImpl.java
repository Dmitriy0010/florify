package ru.florify.customer.adapter.out.persistence.mapper;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.customer.adapter.out.persistence.entity.CustomerJpaEntity;
import ru.florify.customer.domain.model.Customer;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:44+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class CustomerPersistenceMapperImpl implements CustomerPersistenceMapper {

    @Override
    public Customer toDomain(CustomerJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        Customer.CustomerBuilder customer = Customer.builder();

        customer.active( entity.isActive() );
        customer.birthDate( entity.getBirthDate() );
        customer.createdAt( entity.getCreatedAt() );
        customer.email( entity.getEmail() );
        customer.firstName( entity.getFirstName() );
        customer.gender( entity.getGender() );
        customer.id( entity.getId() );
        customer.lastName( entity.getLastName() );
        customer.phone( entity.getPhone() );
        customer.source( entity.getSource() );
        List<String> list = entity.getTags();
        if ( list != null ) {
            customer.tags( new ArrayList<String>( list ) );
        }
        customer.updatedAt( entity.getUpdatedAt() );
        customer.userId( entity.getUserId() );

        return customer.build();
    }

    @Override
    public CustomerJpaEntity toJpaEntity(Customer customer) {
        if ( customer == null ) {
            return null;
        }

        CustomerJpaEntity.CustomerJpaEntityBuilder customerJpaEntity = CustomerJpaEntity.builder();

        customerJpaEntity.id( customer.getId() );
        customerJpaEntity.active( customer.isActive() );
        customerJpaEntity.birthDate( customer.getBirthDate() );
        customerJpaEntity.createdAt( customer.getCreatedAt() );
        customerJpaEntity.email( customer.getEmail() );
        customerJpaEntity.firstName( customer.getFirstName() );
        customerJpaEntity.gender( customer.getGender() );
        customerJpaEntity.lastName( customer.getLastName() );
        customerJpaEntity.phone( customer.getPhone() );
        customerJpaEntity.source( customer.getSource() );
        List<String> list = customer.getTags();
        if ( list != null ) {
            customerJpaEntity.tags( new ArrayList<String>( list ) );
        }
        customerJpaEntity.updatedAt( customer.getUpdatedAt() );
        customerJpaEntity.userId( customer.getUserId() );

        return customerJpaEntity.build();
    }
}
