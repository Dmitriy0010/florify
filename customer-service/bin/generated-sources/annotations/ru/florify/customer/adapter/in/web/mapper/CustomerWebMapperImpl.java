package ru.florify.customer.adapter.in.web.mapper;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.customer.adapter.in.web.dto.CustomerEventResponse;
import ru.florify.customer.adapter.in.web.dto.CustomerResponse;
import ru.florify.customer.adapter.in.web.dto.CustomerSummaryResponse;
import ru.florify.customer.domain.enums.CustomerSource;
import ru.florify.customer.domain.enums.EventType;
import ru.florify.customer.domain.enums.Gender;
import ru.florify.customer.domain.model.Customer;
import ru.florify.customer.domain.model.CustomerEvent;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-27T12:25:53+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class CustomerWebMapperImpl implements CustomerWebMapper {

    @Override
    public CustomerResponse toResponse(Customer domain) {
        if ( domain == null ) {
            return null;
        }

        UUID id = null;
        String phone = null;
        String email = null;
        String firstName = null;
        String lastName = null;
        LocalDate birthDate = null;
        Gender gender = null;
        CustomerSource source = null;
        List<String> tags = null;
        UUID userId = null;
        boolean active = false;
        Instant createdAt = null;
        Instant updatedAt = null;

        id = domain.getId();
        phone = domain.getPhone();
        email = domain.getEmail();
        firstName = domain.getFirstName();
        lastName = domain.getLastName();
        birthDate = domain.getBirthDate();
        gender = domain.getGender();
        source = domain.getSource();
        List<String> list = domain.getTags();
        if ( list != null ) {
            tags = new ArrayList<String>( list );
        }
        userId = domain.getUserId();
        active = domain.isActive();
        createdAt = domain.getCreatedAt();
        updatedAt = domain.getUpdatedAt();

        CustomerResponse customerResponse = new CustomerResponse( id, phone, email, firstName, lastName, birthDate, gender, source, tags, userId, active, createdAt, updatedAt );

        return customerResponse;
    }

    @Override
    public CustomerSummaryResponse toSummaryResponse(Customer domain) {
        if ( domain == null ) {
            return null;
        }

        UUID id = null;
        String phone = null;
        String firstName = null;
        String lastName = null;
        boolean active = false;

        id = domain.getId();
        phone = domain.getPhone();
        firstName = domain.getFirstName();
        lastName = domain.getLastName();
        active = domain.isActive();

        CustomerSummaryResponse customerSummaryResponse = new CustomerSummaryResponse( id, phone, firstName, lastName, active );

        return customerSummaryResponse;
    }

    @Override
    public CustomerEventResponse toResponse(CustomerEvent domain) {
        if ( domain == null ) {
            return null;
        }

        UUID id = null;
        UUID customerId = null;
        UUID performerId = null;
        EventType type = null;
        String content = null;
        Instant occurredAt = null;

        id = domain.id();
        customerId = domain.customerId();
        performerId = domain.performerId();
        type = domain.type();
        content = domain.content();
        occurredAt = domain.occurredAt();

        CustomerEventResponse customerEventResponse = new CustomerEventResponse( id, customerId, performerId, type, content, occurredAt );

        return customerEventResponse;
    }
}
