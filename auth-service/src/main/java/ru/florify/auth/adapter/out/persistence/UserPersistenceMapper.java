package ru.florify.auth.adapter.out.persistence;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import ru.florify.auth.domain.model.User;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface UserPersistenceMapper {

    User toDomain(UserJpaEntity entity);
    
    UserJpaEntity toEntity(User domain);
}
