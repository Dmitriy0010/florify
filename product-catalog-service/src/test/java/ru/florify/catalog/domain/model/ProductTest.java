package ru.florify.catalog.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import ru.florify.common.domain.enums.UnitOfMeasure;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ProductTest {

    @Test
    @DisplayName("updatePrice should change current price and update timestamp")
    void updatePrice_shouldChangeCurrentPrice() {
        // Given
        Instant now = Instant.now();
        Product product = Product.builder()
                .id(UUID.randomUUID())
                .currentPrice(new BigDecimal("100.00"))
                .updatedAt(now.minusSeconds(60))
                .build();

        BigDecimal newPrice = new BigDecimal("150.00");
        Instant updatedTime = Instant.now();

        // When
        Product updated = product.updatePrice(newPrice, updatedTime);

        // Then
        assertEquals(newPrice, updated.getCurrentPrice());
        assertEquals(updatedTime, updated.getUpdatedAt());
        assertNotSame(product, updated);
    }

    @Test
    @DisplayName("updatePrice should throw exception when price is negative")
    void updatePrice_shouldThrow_whenNegativePrice() {
        Product product = Product.builder().currentPrice(BigDecimal.TEN).build();
        assertThrows(IllegalArgumentException.class, () -> product.updatePrice(new BigDecimal("-1.00"), Instant.now()));
    }

    @Test
    @DisplayName("deactivate should set active to false")
    void deactivate_shouldSetActiveFalse() {
        Product product = Product.builder().active(true).build();
        Product deactivated = product.deactivate(Instant.now());
        assertFalse(deactivated.isActive());
    }

    @Test
    @DisplayName("update should change name and category")
    void update_shouldChangeNameAndCategory() {
        // Given
        UUID category1 = UUID.randomUUID();
        UUID category2 = UUID.randomUUID();
        Product product = Product.builder()
                .name("Old Name")
                .categoryId(category1)
                .build();

        // When
        Product updated = product.update("New Name", "New Desc", category2, "img.jpg", 10, Instant.now());

        // Then
        assertEquals("New Name", updated.getName());
        assertEquals(category2, updated.getCategoryId());
    }
}
