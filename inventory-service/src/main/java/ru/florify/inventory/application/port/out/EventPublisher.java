package ru.florify.inventory.application.port.out;

/**
 * Port for publishing domain events.
 * Decoupled from specific event types to allow flexible infrastructure adaptation.
 */
public interface EventPublisher {
    void publish(Object event);
}
