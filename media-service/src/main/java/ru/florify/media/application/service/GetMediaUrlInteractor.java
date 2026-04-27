package ru.florify.media.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.florify.media.application.port.in.GetMediaUrlUseCase;
import ru.florify.media.application.port.out.MediaFileRepository;
import ru.florify.media.application.port.out.MediaStoragePort;
import ru.florify.media.domain.model.MediaFile;
import ru.florify.media.domain.model.MediaFileStatus;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetMediaUrlInteractor implements GetMediaUrlUseCase {

    private final MediaFileRepository mediaFileRepository;
    private final MediaStoragePort mediaStoragePort;

    private static final Duration URL_EXPIRATION = Duration.ofHours(2);

    @Override
    public String getUrl(UUID mediaFileId) {
        MediaFile mediaFile = mediaFileRepository.findByIdOrThrow(mediaFileId);

        if (mediaFile.getStatus() != MediaFileStatus.READY) {
            throw new IllegalStateException("Media file is not READY");
        }

        String key = mediaFile.getBasePath() + "/original";
        return mediaStoragePort.generatePresignedUrl(
                mediaFile.getBucket(),
                key,
                URL_EXPIRATION
        );
    }
}
