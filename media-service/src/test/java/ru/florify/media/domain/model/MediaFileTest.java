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

    @Test
    void getVariant_whenVariantExists_shouldReturnVariant() {
        MediaVariant thumbnail = MediaVariant.create(
                VariantType.THUMBNAIL,
                "media/123/thumbnail.webp",
                1024L,
                200,
                200,
                "image/webp"
        );

        MediaFile file = MediaFile.builder()
                .id(UUID.randomUUID())
                .variants(List.of(thumbnail))
                .build();

        var result = file.getVariant(VariantType.THUMBNAIL);

        assertThat(result).isPresent();
        assertThat(result.get().variantType()).isEqualTo(VariantType.THUMBNAIL);
    }

    @Test
    void getVariant_whenVariantNotExists_shouldReturnEmpty() {
        MediaFile file = MediaFile.builder()
                .id(UUID.randomUUID())
                .variants(List.of())
                .build();

        var result = file.getVariant(VariantType.THUMBNAIL);

        assertThat(result).isEmpty();
    }

    @Test
    void variantShouldHaveIdAfterCreation() {
        // Проверяем что при создании через фабричный метод id = null,
        // но будет установлен при маппинге в JPA
        MediaVariant variant = MediaVariant.create(
                VariantType.THUMBNAIL,
                "key",
                1024L,
                200,
                200,
                "image/webp"
        );

        assertThat(variant.id()).isNull();  // До маппинга в JPA

        // После маппинга в JPA entity id будет сгенерирован
        MediaVariant withId = new MediaVariant(
                UUID.randomUUID(),
                variant.variantType(),
                variant.storedKey(),
                variant.sizeBytes(),
                variant.width(),
                variant.height(),
                variant.contentType()
        );

        assertThat(withId.id()).isNotNull();
    }
}
