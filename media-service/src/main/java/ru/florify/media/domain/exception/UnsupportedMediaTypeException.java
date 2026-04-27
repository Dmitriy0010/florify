package ru.florify.media.domain.exception;

import ru.florify.common.exception.DomainException;

/**
 * Бросается при попытке загрузить файл с неподдерживаемым MIME-типом.
 */
public class UnsupportedMediaTypeException extends DomainException {
    public UnsupportedMediaTypeException(String mimeType) {
        super("UNSUPPORTED_MEDIA_TYPE", "Unsupported media type: " + mimeType + 
              ". Supported: image/jpeg, image/png, image/webp, image/gif");
    }
}
