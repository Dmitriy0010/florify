package ru.florify.auth.application.port.out;

/**
 * Outbound port — async domain event publication.
 *
 * The application layer calls {@link #publish(Object)} with a domain event object.
 * The adapter (KafkaEventPublisher) resolves the correct topic by event type
 * and serialises the payload — the domain knows nothing about Kafka.
 */
public interface AuthEventPublisher {

    /**
     * Publishes a domain event asynchronously.
     *
     * @param event any domain event object (e.g. {@link ru.florify.common.event.UserRegisteredEvent})
     * @throws IllegalArgumentException if no Kafka topic mapping exists for the event type
     */
    void publish(Object event);
}
