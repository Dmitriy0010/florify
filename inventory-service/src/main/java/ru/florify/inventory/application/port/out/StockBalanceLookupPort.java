package ru.florify.inventory.application.port.out;

import ru.florify.inventory.domain.model.StockBalance;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StockBalanceLookupPort {
    Optional<StockBalance> findByProductIdAndStoreId(UUID productId, UUID storeId);
    List<StockBalance> findAllByProductIds(List<UUID> productIds);
    List<StockBalance> findAllByStoreId(UUID storeId, boolean includeArchived);
}
