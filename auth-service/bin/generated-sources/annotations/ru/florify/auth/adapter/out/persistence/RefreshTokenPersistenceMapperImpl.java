package ru.florify.auth.adapter.out.persistence;

import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.auth.domain.model.RefreshToken;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:33+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class RefreshTokenPersistenceMapperImpl implements RefreshTokenPersistenceMapper {

    @Override
    public RefreshToken toDomain(RefreshTokenJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        RefreshToken.RefreshTokenBuilder refreshToken = RefreshToken.builder();

        refreshToken.createdAt( entity.getCreatedAt() );
        refreshToken.deviceInfo( entity.getDeviceInfo() );
        refreshToken.expiresAt( entity.getExpiresAt() );
        refreshToken.id( entity.getId() );
        refreshToken.revoked( entity.isRevoked() );
        refreshToken.tokenHash( entity.getTokenHash() );
        refreshToken.userId( entity.getUserId() );

        return refreshToken.build();
    }

    @Override
    public RefreshTokenJpaEntity toEntity(RefreshToken domain) {
        if ( domain == null ) {
            return null;
        }

        RefreshTokenJpaEntity.RefreshTokenJpaEntityBuilder refreshTokenJpaEntity = RefreshTokenJpaEntity.builder();

        refreshTokenJpaEntity.createdAt( domain.getCreatedAt() );
        refreshTokenJpaEntity.deviceInfo( domain.getDeviceInfo() );
        refreshTokenJpaEntity.expiresAt( domain.getExpiresAt() );
        refreshTokenJpaEntity.id( domain.getId() );
        refreshTokenJpaEntity.revoked( domain.isRevoked() );
        refreshTokenJpaEntity.tokenHash( domain.getTokenHash() );
        refreshTokenJpaEntity.userId( domain.getUserId() );

        return refreshTokenJpaEntity.build();
    }
}
