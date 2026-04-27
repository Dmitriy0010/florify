package ru.florify.auth.adapter.in.web.mapper;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.auth.adapter.in.web.dto.UserResponse;
import ru.florify.auth.domain.model.Role;
import ru.florify.auth.domain.model.User;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-27T12:25:52+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class UserWebMapperImpl implements UserWebMapper {

    @Override
    public UserResponse toResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UUID id = null;
        String email = null;
        String phone = null;
        String firstName = null;
        String lastName = null;
        Set<Role> roles = null;
        Instant createdAt = null;

        id = user.id();
        email = user.email();
        phone = user.phone();
        firstName = user.firstName();
        lastName = user.lastName();
        Set<Role> set = user.roles();
        if ( set != null ) {
            roles = new LinkedHashSet<Role>( set );
        }
        createdAt = user.createdAt();

        UserResponse userResponse = new UserResponse( id, email, phone, firstName, lastName, roles, createdAt );

        return userResponse;
    }
}
