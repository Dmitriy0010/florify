package ru.florify.notification.domain.model;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder(toBuilder = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class NotificationTemplate {

    @EqualsAndHashCode.Include
    private final UUID id;

    private final String code;
    private final Channel channel;
    private final String subject;
    private final String bodyTemplate;
    private final boolean isActive;

    public void validateInvariants() {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Template code must not be blank");
        }
        if (channel == null) {
            throw new IllegalArgumentException("Template channel must not be null");
        }
        if (bodyTemplate == null || bodyTemplate.isBlank()) {
            throw new IllegalArgumentException("Template body must not be blank");
        }
        if (channel == Channel.EMAIL && (subject == null || subject.isBlank())) {
            throw new IllegalArgumentException("Email template subject must not be blank");
        }
    }

    public NotificationTemplate activate() {
        return this.toBuilder().isActive(true).build();
    }

    public NotificationTemplate deactivate() {
        return this.toBuilder().isActive(false).build();
    }
}

