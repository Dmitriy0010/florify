package ru.florify.notification.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.florify.notification.domain.model.Channel;

import java.util.UUID;

@Entity
@Table(
        name = "notification_templates",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_notification_templates_code_channel",
                columnNames = {"code", "channel"}
        )
)
@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
public class NotificationTemplateJpaEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "code", nullable = false, length = 200)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 30)
    private Channel channel;

    @Column(name = "subject", length = 500)
    private String subject;

    @Column(name = "body_template", nullable = false, columnDefinition = "TEXT")
    private String bodyTemplate;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;
}

