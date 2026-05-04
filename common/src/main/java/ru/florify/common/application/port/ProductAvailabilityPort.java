package ru.florify.common.application.port;

import java.util.List;
import java.util.UUID;

/**
 * Interface for checking product availability across modules.
 * Implemented by inventory-service, used by catalog-service.
 */
public interface ProductAvailabilityPort {
    /**
     * Returns a list of product IDs that have a positive stock balance in the specified store.
     */
    List<UUID> getAvailableProductIds(UUID storeId);
}
