package ru.florify.inventory.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import ru.florify.common.exception.InsufficientStockException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class StockBalanceTest {

    @Test
    @DisplayName("Should correctly calculate Weighted Average Cost (WAC) upon receiving stock")
    void shouldCalculateWacOnReceive() {
        // Given: Empty balance
        UUID productId = UUID.randomUUID();
        StockBalance balance = StockBalance.createEmpty(productId, UUID.randomUUID());

        // When: First delivery (10 units @ 100.00)
        balance = balance.receive(new BigDecimal("10.00"), new BigDecimal("100.00"));

        // Then: WAC = 100.00
        assertEquals(new BigDecimal("10.00"), balance.getQuantityInStock());
        assertEquals(new BigDecimal("100.00").setScale(2, RoundingMode.HALF_UP), balance.getAverageCost());

        // When: Second delivery (10 units @ 120.00)
        balance = balance.receive(new BigDecimal("10.00"), new BigDecimal("120.00"));

        // Then: TotalValue = (10*100) + (10*120) = 2200. TotalQty = 20. WAC = 110.00
        assertEquals(new BigDecimal("20.00"), balance.getQuantityInStock());
        assertEquals(new BigDecimal("110.00").setScale(2, RoundingMode.HALF_UP), balance.getAverageCost());
    }

    @Test
    @DisplayName("Should decrease quantity on write-off without changing WAC")
    void shouldDecreaseQuantityOnWriteOff() {
        // Given: Balance with 10 units @ 100.00
        StockBalance balance = new StockBalance(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("10.00"), new BigDecimal("100.00"));

        // When: Write off 3 units
        balance = balance.writeOff(new BigDecimal("3.00"));

        // Then: Qty = 7, WAC = 100.00
        assertEquals(new BigDecimal("7.00"), balance.getQuantityInStock());
        assertEquals(new BigDecimal("100.00"), balance.getAverageCost());
    }

    @Test
    @DisplayName("Should throw InsufficientStockException when writing off more than available")
    void shouldThrowExceptionOnInsufficientStock() {
        // Given: Balance with 5 units
        StockBalance balance = new StockBalance(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("5.00"), new BigDecimal("100.00"));

        // Then: Throw exception
        assertThrows(InsufficientStockException.class, () -> balance.writeOff(new BigDecimal("6.00")));
    }
}
