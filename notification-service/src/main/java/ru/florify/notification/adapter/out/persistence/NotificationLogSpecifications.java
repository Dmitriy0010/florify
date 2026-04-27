package ru.florify.notification.adapter.out.persistence;

import org.springframework.data.jpa.domain.Specification;
import ru.florify.notification.adapter.out.persistence.entity.NotificationLogJpaEntity;
import ru.florify.notification.application.query.NotificationLogSearchQuery;

public final class NotificationLogSpecifications {

    private NotificationLogSpecifications() {
    }

    public static Specification<NotificationLogJpaEntity> fromQuery(NotificationLogSearchQuery q) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();

            if (q == null) {
                return predicates;
            }

            if (q.recipientId() != null) {
                predicates.getExpressions().add(cb.equal(root.get("recipientId"), q.recipientId()));
            }
            if (q.templateCode() != null && !q.templateCode().isBlank()) {
                predicates.getExpressions().add(cb.equal(root.get("templateCode"), q.templateCode()));
            }
            if (q.channel() != null) {
                predicates.getExpressions().add(cb.equal(root.get("channel"), q.channel()));
            }
            if (q.status() != null) {
                predicates.getExpressions().add(cb.equal(root.get("status"), q.status()));
            }
            if (q.from() != null) {
                predicates.getExpressions().add(cb.greaterThanOrEqualTo(root.get("sentAt"), q.from()));
            }
            if (q.to() != null) {
                predicates.getExpressions().add(cb.lessThanOrEqualTo(root.get("sentAt"), q.to()));
            }
            return predicates;
        };
    }
}

