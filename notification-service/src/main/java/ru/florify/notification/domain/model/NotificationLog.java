package ru.florify.notification.domain.model;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder(toBuilder = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class NotificationLog {

    @EqualsAndHashCode.Include
    private final UUID id;

    private final UUID recipientId;
    private final String recipientContact;
    private final Channel channel;
    private final String templateCode;

    private final SendStatus status;
    private final Instant sentAt;
    private final String errorMessage;

    public NotificationLog markSent(Instant sentAt) {
        return this.toBuilder()
                .status(SendStatus.SENT)
                .sentAt(sentAt)
                .errorMessage(null)
                .build();
    }

    public NotificationLog markFailed(Instant attemptedAt, String errorMessage) {
        return this.toBuilder()
                .status(SendStatus.FAILED)
                .sentAt(attemptedAt)
                .errorMessage(errorMessage)
                .build();
    }
}

