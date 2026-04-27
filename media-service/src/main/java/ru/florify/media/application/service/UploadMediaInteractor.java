package ru.florify.media.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.media.application.command.UploadMediaCommand;
import ru.florify.media.application.port.in.UploadMediaUseCase;
import ru.florify.media.application.port.out.MediaFileRepository;
import ru.florify.media.application.port.out.MediaStoragePort;
import ru.florify.media.domain.exception.UnsupportedMediaTypeException;
import ru.florify.media.domain.model.MediaFile;
import ru.florify.media.domain.model.MediaFileStatus;
import java.util.Set;

import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadMediaInteractor implements UploadMediaUseCase {

    private final MediaFileRepository mediaFileRepository;
    private final MediaStoragePort mediaStoragePort;

    private static final String BUCKET = "florify-media";

    @Override
    public MediaFile upload(UploadMediaCommand command) {
        log.info("Process upload: filename={}, mimeType={}", command.originalFilename(), command.mimeType());

        Set<String> supportedMimeTypes = Set.of("image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf");
        if (!supportedMimeTypes.contains(command.mimeType())) {
            throw new UnsupportedMediaTypeException(command.mimeType());
        }

        UUID mediaFileId = UUID.randomUUID();
        String basePath = "media/" + mediaFileId;
        String originalKey = basePath + "/original";

        MediaFile mediaFile = MediaFile.builder()
                .id(mediaFileId)
                .originalFilename(command.originalFilename())
                .mimeType(command.mimeType())
                .bucket(BUCKET)
                .basePath(basePath)
                .status(MediaFileStatus.PROCESSING)
                .uploadedBy(command.uploaderId())
                .uploadedAt(Instant.now())
                .build();

        MediaFile saved = saveInTransaction(mediaFile);

        try {
            mediaStoragePort.store(BUCKET, originalKey, command.bytes(), command.mimeType());
        } catch (Exception e) {
            log.error("Storage failed for key {}", originalKey, e);
            markErrorInTransaction(saved);
            throw new RuntimeException("Storage failed", e);
        }

        MediaFile ready = saved.toBuilder().build();
        ready.markReady();
        return saveInTransaction(ready);
    }

    @Transactional
    protected MediaFile saveInTransaction(MediaFile mediaFile) {
        return mediaFileRepository.save(mediaFile);
    }

    @Transactional
    protected void markErrorInTransaction(MediaFile mediaFile) {
        mediaFile.markError();
        mediaFileRepository.save(mediaFile);
    }
}
