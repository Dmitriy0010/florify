package ru.florify.inventory.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.inventory.adapter.in.web.dto.EnhancedStockBalanceResponse;
import ru.florify.inventory.application.port.in.GetAllStockBalancesUseCase;
import ru.florify.inventory.application.port.out.ProductLookupPort;
import ru.florify.inventory.application.port.out.StockBalanceLookupPort;
import ru.florify.inventory.domain.model.CatalogProduct;
import ru.florify.inventory.domain.model.StockBalance;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetAllStockBalancesInteractor implements GetAllStockBalancesUseCase {

    private final StockBalanceLookupPort balanceLookup;
    private final ProductLookupPort productLookup;
    private final ru.florify.inventory.application.port.out.StockBatchRepository batchRepository;

    @Override
    @Transactional(readOnly = true)
    public List<EnhancedStockBalanceResponse> execute(ru.florify.inventory.application.port.in.GetStocksQuery query) {
        // 1. Get all balances for store
        Map<UUID, StockBalance> balanceMap = balanceLookup.findAllByStoreId(query.storeId(), query.includeArchived()).stream()
                .collect(Collectors.toMap(StockBalance::getProductId, Function.identity(), (a, b) -> a));
        
        // 2. Get all products from catalog
        List<CatalogProduct> products = productLookup.findAll().stream()
                .filter(p -> query.includeArchived() || p.isActive())
                .toList();

        // 3. Map to Enhanced Response
        return products.stream()
                .map(p -> {
                    StockBalance b = balanceMap.getOrDefault(p.getProductId(), StockBalance.createEmpty(p.getProductId(), query.storeId()));
                    
                    List<ru.florify.inventory.domain.model.StockBatch> availableBatches = (b.getProductId() != null) ?
                        batchRepository.findAvailableByProductIdAndStoreIdOrderByReceivedAtAsc(b.getProductId(), query.storeId())
                        : List.of();
                    
                    java.math.BigDecimal totalFromBatches = availableBatches.stream()
                        .map(ru.florify.inventory.domain.model.StockBatch::getQuantityRemaining)
                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

                    List<ru.florify.inventory.adapter.in.web.dto.StockBatchDto> batchDtos = availableBatches.stream()
                        .map(batch -> new ru.florify.inventory.adapter.in.web.dto.StockBatchDto(
                            batch.getId(),
                            batch.getSupplierId(),
                            null, // supplierName (will be enriched on frontend)
                            batch.getQuantityReceived(),
                            batch.getQuantityRemaining(),
                            batch.getUnitCost(),
                            batch.getReceivedAt(),
                            batch.getExpiresAt(),
                            batch.getStatus(),
                            batch.getSourceDocumentId()
                        )).toList();

                    return new EnhancedStockBalanceResponse(
                            b.getId(),
                            b.getProductId(),
                            p != null ? p.getName() : "Unknown Product",
                            p != null ? p.getSku() : null,
                            p != null ? p.getImageUrl() : null,
                            "General",
                            totalFromBatches,
                            p != null ? p.getUnit() : "pcs",
                            b.getAverageCost(),
                            10,
                            Instant.now(),
                            batchDtos
                    );
                })
                .toList(); // Java 16+ cleaner way
    }
}
