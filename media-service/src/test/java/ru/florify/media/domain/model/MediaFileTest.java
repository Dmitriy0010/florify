package ru.florify.media.domain.model;

import org.junit.jupiter.api.Test;
import ru.florify.media.domain.exception.MediaFileDeletedException;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MediaFileTest {

    @Test
    void markReady_whenStatusIsProcessing_shouldTransitionToReady() {
        MediaFile file = MediaFile.builder()
                .id(UUID.randomUUID())
                .status(MediaFileStatus.PROCESSING)
                .build();

        file.markReady();

        assertThat(file.getStatus()).isEqualTo(MediaFileStatus.READY);
    }

    @Test
    void markReady_whenStatusIsDeleted_shouldThrowIllegalStateException() {
        MediaFile file = MediaFile.builder()
                .id(UUID.randomUUID())
                .status(MediaFileStatus.DELETED)
                .build();

        assertThatThrownBy(file::markReady)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot mark file as READY");
    }

    @Test
    void markDeleted_whenStatusIsReady_shouldTransitionToDeleted() {
        MediaFile file = MediaFile.builder()
                .id(UUID.randomUUID())
                .status(MediaFileStatus.READY)
                .build();

        file.markDeleted();

        assertThat(file.getStatus()).isEqualTo(MediaFileStatus.DELETED);
    }

    @Test
    void markDeleted_whenAlreadyDeleted_shouldThrowMediaFileDeletedException() {
        MediaFile file = MediaFile.builder()
                .id(UUID.randomUUID())
                .status(MediaFileStatus.DELETED)
                .build();

        assertThatThrownBy(file::markDeleted)
                .isInstanceOf(MediaFileDeletedException.class);
    }

    @Test
    void markDeleted_whenStatusIsError_shouldThrowIllegalStateException() {
        MediaFile file = MediaFile.builder()
                .id(UUID.randomUUID())
                .status(MediaFileStatus.ERROR)
                .build();

        assertThatThrownBy(file::markDeleted)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot mark file as DELETED");
    }

    @Test
    void markError_whenStatusIsProcessing_shouldTransitionToError() {
        MediaFile file = MediaFile.builder()
                .id(UUID.randomUUID())
                .status(MediaFileStatus.PROCESSING)
                .build();

        file.markError();

        assertThat(file.getStatus()).isEqualTo(MediaFileStatus.ERROR);
    }

    @Test
    void markError_whenStatusIsDeleted_shouldThrowIllegalStateException() {
        MediaFile file = MediaFile.builder()
                .id(UUID.randomUUID())
                .status(MediaFileStatus.DELETED)
                .build();

        assertThatThrownBy(file::markError)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot mark file as ERROR");
    }

    @Test
    void markError_whenStatusIsAlreadyError_shouldThrowIllegalStateException() {
        MediaFile file = MediaFile.builder()
                .id(UUID.randomUUID())
                .status(MediaFileStatus.ERROR)
                .build();

        assertThatThrownBy(file::markError)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot mark file as ERROR");
    }


}
