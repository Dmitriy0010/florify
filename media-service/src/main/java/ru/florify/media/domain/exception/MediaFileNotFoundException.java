package ru.florify.media.domain.exception;

import ru.florify.common.exception.NotFoundException;

import java.util.UUID;

/**
 * Бросается, если медиафайл не найден.
 */
public class MediaFileNotFoundException extends NotFoundException {
    public MediaFileNotFoundException(UUID id) {
        super("Media file", id);
    }
}
