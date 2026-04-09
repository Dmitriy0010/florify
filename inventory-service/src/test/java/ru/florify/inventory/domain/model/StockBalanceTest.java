package ru.florify.inventory.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import ru.florify.inventory.domain.exception.InsufficientStockException;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class StockBalanceTest {

    @Test
    @DisplayName("Should correctly calculate WAC on multiple receipts and preserve version")
    void shouldCalculateWacCorrectly() {
        UUID productId = UUID.randomUUID();
        // Initial version is 0
        StockBalance balance = StockBalance.createEmpty(productId);
        assertEquals(0, balance.getVersion());

        // First receipt
        balance = balance.receive(new BigDecimal("10"), new BigDecimal("50.00"));
        assertEquals(new BigDecimal("10"), balance.getQuantityInStock());
        assertEquals(new BigDecimal("50.00"), balance.getAverageCost());
        assertEquals(0, balance.getVersion()); // Version shouldn't change in domain method

        // Second receipt
        balance = balance.receive(new BigDecimal("10"), new BigDecimal("100.00"));
        assertEquals(new BigDecimal("20"), balance.getQuantityInStock());
        assertEquals(new BigDecimal("75.00"), balance.getAverageCost());
        assertEquals(0, balance.getVersion());
    }

    @Test
    @DisplayName("Should decrease quantity on writeOff without changing WAC or version")
    void shouldDecreaseQuantityOnWriteOff() {
        UUID productId = UUID.randomUUID();
        // Simulate existing balance with version from DB
        StockBalance balance = new StockBalance(UUID.randomUUID(), productId, new BigDecimal("10"), new BigDecimal("50.00"), 5);

        balance = balance.writeOff(new BigDecimal("4"));
        assertEquals(new BigDecimal("6"), balance.getQuantityInStock());
        assertEquals(new BigDecimal("50.00"), balance.getAverageCost());
        assertEquals(5, balance.getVersion());
    }

    @Test
    @DisplayName("Should throw exception if writing off more than stock")
    void shouldThrowExceptionOnInsufficientStock() {
        UUID productId = UUID.randomUUID();
        StockBalance balance = StockBalance.createEmpty(productId)
                .receive(new BigDecimal("10"), new BigDecimal("50.00"));

        assertThrows(InsufficientStockException.class, () -> balance.writeOff(new BigDecimal("11")));
    }

    @Test
    @DisplayName("Should throw exception on invalid receive parameters")
    void shouldThrowExceptionOnInvalidReceiveParameters() {
        UUID productId = UUID.randomUUID();
        StockBalance balance = StockBalance.createEmpty(productId);

        assertThrows(IllegalArgumentException.class, () -> balance.receive(BigDecimal.ZERO, new BigDecimal("50.00")));
        assertThrows(IllegalArgumentException.class, () -> balance.receive(new BigDecimal("-1"), new BigDecimal("50.00")));
        assertThrows(IllegalArgumentException.class, () -> balance.receive(new BigDecimal("10"), new BigDecimal("-50.00")));
    }
}
