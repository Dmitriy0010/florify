package ru.florify.store.adapter.in.web;

import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.store.application.port.in.CreateStoreCommand;
import ru.florify.store.domain.model.Store;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:59+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class StoreWebMapperImpl implements StoreWebMapper {

    @Override
    public Store toDomain(StoreRequest request) {
        if ( request == null ) {
            return null;
        }

        Store.StoreBuilder store = Store.builder();

        store.address( request.address() );
        store.name( request.name() );
        store.phone( request.phone() );

        return store.build();
    }

    @Override
    public StoreResponse toResponse(Store domain) {
        if ( domain == null ) {
            return null;
        }

        UUID id = null;
        String name = null;
        String address = null;
        String phone = null;
        boolean active = false;

        id = domain.getId();
        name = domain.getName();
        address = domain.getAddress();
        phone = domain.getPhone();
        active = domain.isActive();

        StoreResponse storeResponse = new StoreResponse( id, name, address, phone, active );

        return storeResponse;
    }

    @Override
    public CreateStoreCommand toCommand(StoreRequest request) {
        if ( request == null ) {
            return null;
        }

        String name = null;
        String address = null;
        String phone = null;
        boolean active = false;

        name = request.name();
        address = request.address();
        phone = request.phone();
        active = request.active();

        CreateStoreCommand createStoreCommand = new CreateStoreCommand( name, address, phone, active );

        return createStoreCommand;
    }
}
