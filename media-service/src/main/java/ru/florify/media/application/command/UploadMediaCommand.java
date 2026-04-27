package ru.florify.media.application.command;

import java.util.UUID;

public record UploadMediaCommand(
        String originalFilename,
        String mimeType,
        byte[] bytes,
        UUID uploaderId
) {
}
