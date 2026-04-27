package ru.florify.inventory.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.EqualsAndHashCode;
import lombok.With;
import ru.florify.common.exception.InsufficientStockException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

/**
 * Aggregate root for Stock Balance and WAC calculation.
 */
@Getter
@Builder
@With
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class StockBalance {
    @EqualsAndHashCode.Include
    private final UUID id;
    private final UUID productId;
    private final UUID storeId;
    private final BigDecimal quantityInStock;
    private final BigDecimal averageCost;

    public static StockBalance createEmpty(UUID productId, UUID storeId) {
        return new StockBalance(UUID.randomUUID(), productId, storeId, BigDecimal.ZERO, BigDecimal.ZERO);
    }

    /**
     * Increases stock and recalculates Weighted Average Cost (WAC).
     */
    public StockBalance receive(BigDecimal quantity, BigDecimal price) {
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }

        BigDecimal newQuantity = this.quantityInStock.add(quantity);
        
        BigDecimal currentTotalValue = this.quantityInStock.multiply(this.averageCost);
        BigDecimal addedValue = quantity.multiply(price);
        BigDecimal newAverageCost = currentTotalValue.add(addedValue)
                .divide(newQuantity, 2, RoundingMode.HALF_UP);

        return new StockBalance(this.id, this.productId, this.storeId, newQuantity, newAverageCost);
    }

    /**
     * Decreases stock. WAC remains unchanged.
     */
    public StockBalance writeOff(BigDecimal quantity) {
        if (this.quantityInStock.compareTo(quantity) < 0) {
            throw new InsufficientStockException("Insufficient stock for product " + productId);
        }
        return new StockBalance(this.id, this.productId, this.storeId, this.quantityInStock.subtract(quantity), this.averageCost);
    }
}
