package ru.florify.media.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.media.application.command.DeleteMediaCommand;
import ru.florify.media.application.port.in.DeleteMediaUseCase;
import ru.florify.media.application.port.out.MediaFileRepository;
import ru.florify.media.application.port.out.MediaStoragePort;
import ru.florify.media.domain.model.MediaFile;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeleteMediaInteractor implements DeleteMediaUseCase {

    private final MediaFileRepository mediaFileRepository;
    private final MediaStoragePort mediaStoragePort;

    @Override
    public void delete(DeleteMediaCommand command) {
        log.info("Deleting media: {}", command.mediaFileId());

        // Step 1: Mark as DELETED in DB (Transaction 1)
        MediaFile mediaFile = markDeletedInTransaction(command.mediaFileId());

        // Step 2: Delete from Storage (Outside transaction)
        String originalKey = mediaFile.getBasePath() + "/original";
        try {
            mediaStoragePort.delete(mediaFile.getBucket(), originalKey);
        } catch (Exception e) {
            log.warn("Failed to delete original file {} from storage", originalKey, e);
        }
    }

    @Transactional
    protected MediaFile markDeletedInTransaction(UUID id) {
        MediaFile mediaFile = mediaFileRepository.findByIdOrThrow(id);
        mediaFile.markDeleted();
        return mediaFileRepository.save(mediaFile);
    }
}
