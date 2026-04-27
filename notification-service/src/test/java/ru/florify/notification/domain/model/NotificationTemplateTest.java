package ru.florify.notification.domain.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class NotificationTemplateTest {

    @Test
    void validateInvariants_whenEmailWithoutSubject_shouldThrow() {
        NotificationTemplate template = NotificationTemplate.builder()
                .code("ORDER_CREATED")
                .channel(Channel.EMAIL)
                .subject("")
                .bodyTemplate("Hello")
                .isActive(true)
                .build();

        assertThatThrownBy(template::validateInvariants)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("subject");
    }

    @Test
    void validateInvariants_whenBodyIsBlank_shouldThrow() {
        NotificationTemplate template = NotificationTemplate.builder()
                .code("LOW_STOCK")
                .channel(Channel.TELEGRAM)
                .bodyTemplate(" ")
                .isActive(true)
                .build();

        assertThatThrownBy(template::validateInvariants)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("body");
    }
}

