package ru.florify.store.adapter.out.persistence.mapper;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.store.adapter.out.persistence.entity.StoreJpaEntity;
import ru.florify.store.domain.model.Store;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:59+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class StoreMapperImpl implements StoreMapper {

    @Override
    public Store toDomain(StoreJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        Store.StoreBuilder store = Store.builder();

        store.active( entity.isActive() );
        store.address( entity.getAddress() );
        store.id( entity.getId() );
        store.name( entity.getName() );
        store.phone( entity.getPhone() );

        return store.build();
    }

    @Override
    public StoreJpaEntity toJpa(Store domain) {
        if ( domain == null ) {
            return null;
        }

        StoreJpaEntity.StoreJpaEntityBuilder storeJpaEntity = StoreJpaEntity.builder();

        storeJpaEntity.active( domain.isActive() );
        storeJpaEntity.address( domain.getAddress() );
        storeJpaEntity.id( domain.getId() );
        storeJpaEntity.name( domain.getName() );
        storeJpaEntity.phone( domain.getPhone() );

        return storeJpaEntity.build();
    }
}
