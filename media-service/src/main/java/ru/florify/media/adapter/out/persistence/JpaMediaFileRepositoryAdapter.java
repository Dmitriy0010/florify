package ru.florify.media.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.media.adapter.out.persistence.repository.MediaFileJpaRepository;
import ru.florify.media.adapter.out.persistence.mapper.MediaPersistenceMapper;
import ru.florify.media.application.port.out.MediaFileRepository;
import ru.florify.media.domain.exception.MediaFileNotFoundException;
import ru.florify.media.domain.model.MediaFile;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JpaMediaFileRepositoryAdapter implements MediaFileRepository {

    private final MediaFileJpaRepository repository;
    private final MediaPersistenceMapper mapper;

    @Override
    public MediaFile save(MediaFile mediaFile) {
        var entity = mapper.toEntity(mediaFile);
        return mapper.toDomain(repository.save(entity));
    }

    @Override
    public Optional<MediaFile> findById(UUID id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public MediaFile findByIdOrThrow(UUID id) {
        return findById(id).orElseThrow(() -> new MediaFileNotFoundException(id));
    }
}
