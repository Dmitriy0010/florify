package ru.florify.auth.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.auth.application.port.out.RefreshTokenRepository;
import ru.florify.auth.domain.model.RefreshToken;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JpaRefreshTokenRepositoryAdapter implements RefreshTokenRepository {

    private final RefreshTokenJpaRepository repository;
    private final RefreshTokenPersistenceMapper mapper;

    @Override
    public RefreshToken save(RefreshToken token) {
        RefreshTokenJpaEntity entity = mapper.toEntity(token);
        RefreshTokenJpaEntity saved = repository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<RefreshToken> findByTokenHash(String hash) {
        return repository.findByTokenHash(hash).map(mapper::toDomain);
    }

    @Override
    public List<RefreshToken> findAllByUserId(UUID userId) {
        return repository.findAllByUserId(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void revokeAllByUserId(UUID userId) {
        repository.revokeAllByUserId(userId);
    }
}
