package ru.florify.inventory.adapter.out.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.florify.common.application.port.ProductAvailabilityPort;
import ru.florify.inventory.application.port.out.StockBalanceLookupPort;
import ru.florify.inventory.domain.model.StockBalance;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of the common availability port for other modules to use.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryAvailabilityAdapter implements ProductAvailabilityPort {

    private final StockBalanceLookupPort stockBalanceLookupPort;

    @Override
    public List<UUID> getAvailableProductIds(UUID storeId) {
        log.info("Requesting available product IDs for store: {}", storeId);
        List<StockBalance> balances = stockBalanceLookupPort.findAllByStoreId(storeId, false);
        log.info("Found {} stock balances in DB for store {}", balances.size(), storeId);

        List<UUID> availableIds = balances.stream()
                .filter(balance -> {
                    boolean hasStock = balance.getQuantityInStock().compareTo(BigDecimal.ZERO) > 0;
                    if (!hasStock) {
                        log.debug("Product {} has 0 stock, skipping", balance.getProductId());
                    }
                    return hasStock;
                })
                .map(StockBalance::getProductId)
                .collect(Collectors.toList());

        log.info("Returning {} available products for store {}", availableIds.size(), storeId);
        return availableIds;
    }
}
