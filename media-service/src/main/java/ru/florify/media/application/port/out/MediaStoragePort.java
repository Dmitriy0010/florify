package ru.florify.media.application.port.out;

import java.time.Duration;

public interface MediaStoragePort {
    void store(String bucket, String key, byte[] bytes, String contentType);
    String generatePresignedUrl(String bucket, String key, Duration expiresIn);
    void delete(String bucket, String key);
}
