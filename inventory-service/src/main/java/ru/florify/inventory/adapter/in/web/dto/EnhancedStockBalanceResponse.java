package ru.florify.inventory.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import java.util.List;

/**
 * Enriched DTO for the inventory list view, combining balance and product metadata.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EnhancedStockBalanceResponse {
    private UUID id;
    private UUID productId;
    private String name;
    private String sku;
    private String imageUrl;
    private String category;
    private BigDecimal quantity;
    
    // Alias for frontend compatibility
    public BigDecimal getQuantityInStock() {
        return quantity;
    }

    private String unit;
    private BigDecimal averageCost;
    private int minThreshold;
    private Instant lastUpdated;
    private List<StockBatchDto> batches;
}
