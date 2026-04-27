package ru.florify.media.adapter.in.web.dto;

import ru.florify.media.domain.model.MediaFileStatus;
import java.time.Instant;
import java.util.UUID;

public record MediaUploadResponse(
    UUID id,
    String originalFilename,
    String mimeType,
    MediaFileStatus status,
    String url,
    Instant uploadedAt
) {}
