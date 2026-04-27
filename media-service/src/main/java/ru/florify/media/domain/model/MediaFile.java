package ru.florify.media.domain.model;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import ru.florify.media.domain.exception.MediaFileDeletedException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Агрегат медиафайла.
 */
@Getter
@Setter
@Builder(toBuilder = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class MediaFile {

    @EqualsAndHashCode.Include
    private final UUID id;

    private final String originalFilename;
    private final String mimeType;
    private final String bucket;
    private final String basePath;
    private MediaFileStatus status;

    private final UUID uploadedBy;
    private final Instant uploadedAt;

    /**
     * Помечает файл как готовый.
     */
    public void markReady() {
        if (this.status == MediaFileStatus.DELETED) {
            throw new IllegalStateException("Cannot mark file as READY when it is DELETED");
        }
        this.status = MediaFileStatus.READY;
    }

    /**
     * Помечает файл как удалённый.
     */
    public void markDeleted() {
        this.status = MediaFileStatus.DELETED;
    }

    /**
     * Помечает файл в статус ошибки.
     */
    public void markError() {
        if (this.status == MediaFileStatus.DELETED) {
            throw new IllegalStateException("Cannot mark file as ERROR when it is DELETED");
        }
        this.status = MediaFileStatus.ERROR;
    }
}
