package ru.florify.auth.adapter.out.persistence;

import java.util.LinkedHashSet;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.auth.domain.model.Role;
import ru.florify.auth.domain.model.User;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:33+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class UserPersistenceMapperImpl implements UserPersistenceMapper {

    @Override
    public User toDomain(UserJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.id( entity.getId() );
        user.email( entity.getEmail() );
        user.phone( entity.getPhone() );
        user.firstName( entity.getFirstName() );
        user.lastName( entity.getLastName() );
        user.passwordHash( entity.getPasswordHash() );
        Set<Role> set = entity.getRoles();
        if ( set != null ) {
            user.roles( new LinkedHashSet<Role>( set ) );
        }
        user.active( entity.isActive() );
        user.createdAt( entity.getCreatedAt() );

        return user.build();
    }

    @Override
    public UserJpaEntity toEntity(User domain) {
        if ( domain == null ) {
            return null;
        }

        UserJpaEntity.UserJpaEntityBuilder userJpaEntity = UserJpaEntity.builder();

        userJpaEntity.active( domain.active() );
        userJpaEntity.createdAt( domain.createdAt() );
        userJpaEntity.email( domain.email() );
        userJpaEntity.firstName( domain.firstName() );
        userJpaEntity.id( domain.id() );
        userJpaEntity.lastName( domain.lastName() );
        userJpaEntity.passwordHash( domain.passwordHash() );
        userJpaEntity.phone( domain.phone() );
        Set<Role> set = domain.roles();
        if ( set != null ) {
            userJpaEntity.roles( new LinkedHashSet<Role>( set ) );
        }

        return userJpaEntity.build();
    }
}
