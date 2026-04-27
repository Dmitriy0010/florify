package ru.florify.media.application.port.in;

import java.util.UUID;

public interface GetMediaUrlUseCase {
    String getUrl(UUID mediaFileId);
}
