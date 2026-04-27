package ru.florify.auth.adapter.out.persistence;
 
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import ru.florify.auth.domain.model.RefreshToken;
 
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface RefreshTokenPersistenceMapper {
 
    RefreshToken toDomain(RefreshTokenJpaEntity entity);
 
    RefreshTokenJpaEntity toEntity(RefreshToken domain);
}
