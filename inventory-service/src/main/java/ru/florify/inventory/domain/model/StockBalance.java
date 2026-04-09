package ru.florify.inventory.domain.model;

import ru.florify.inventory.domain.exception.InsufficientStockException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

/**
 * Aggregate root for Stock Balance and WAC calculation.
 */
public class StockBalance {
    private final UUID id;
    private final UUID productId;
    private final BigDecimal quantityInStock;
    private final BigDecimal averageCost;
    private final Integer version;

    public StockBalance(UUID id, UUID productId, BigDecimal quantityInStock, BigDecimal averageCost, Integer version) {
        this.id = id;
        this.productId = productId;
        this.quantityInStock = quantityInStock;
        this.averageCost = averageCost;
        this.version = version;
    }

    public UUID getId() { return id; }
    public UUID getProductId() { return productId; }
    public BigDecimal getQuantityInStock() { return quantityInStock; }
    public BigDecimal getAverageCost() { return averageCost; }
    public Integer getVersion() { return version; }

    public static StockBalance createEmpty(UUID productId) {
        return new StockBalance(UUID.randomUUID(), productId, BigDecimal.ZERO, BigDecimal.ZERO, 0);
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

        return new StockBalance(this.id, this.productId, newQuantity, newAverageCost, this.version);
    }

    /**
     * Decreases stock. WAC remains unchanged.
     */
    public StockBalance writeOff(BigDecimal quantity) {
        if (this.quantityInStock.compareTo(quantity) < 0) {
            throw new InsufficientStockException("Insufficient stock for product " + productId);
        }
        return new StockBalance(this.id, this.productId, this.quantityInStock.subtract(quantity), this.averageCost, this.version);
    }
}
