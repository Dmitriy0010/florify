package ru.florify.notification.domain.model;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationLogTest {

    @Test
    void markSent_shouldSetStatusAndSentAtAndClearError() {
        NotificationLog log = NotificationLog.builder()
                .id(UUID.randomUUID())
                .recipientId(UUID.randomUUID())
                .recipientContact("x")
                .channel(Channel.TELEGRAM)
                .templateCode("LOW_STOCK")
                .status(SendStatus.PENDING)
                .sentAt(null)
                .errorMessage("oops")
                .build();

        Instant now = Instant.now();
        NotificationLog sent = log.markSent(now);

        assertThat(sent.getStatus()).isEqualTo(SendStatus.SENT);
        assertThat(sent.getSentAt()).isEqualTo(now);
        assertThat(sent.getErrorMessage()).isNull();
    }

    @Test
    void markFailed_shouldSetStatusAndSentAtAndError() {
        NotificationLog log = NotificationLog.builder()
                .id(UUID.randomUUID())
                .recipientId(UUID.randomUUID())
                .recipientContact("x")
                .channel(Channel.EMAIL)
                .templateCode("ORDER_CREATED")
                .status(SendStatus.PENDING)
                .sentAt(null)
                .errorMessage(null)
                .build();

        Instant now = Instant.now();
        NotificationLog failed = log.markFailed(now, "smtp down");

        assertThat(failed.getStatus()).isEqualTo(SendStatus.FAILED);
        assertThat(failed.getSentAt()).isEqualTo(now);
        assertThat(failed.getErrorMessage()).isEqualTo("smtp down");
    }
}

