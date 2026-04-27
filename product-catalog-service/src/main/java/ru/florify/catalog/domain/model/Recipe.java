package ru.florify.catalog.domain.model;

import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Recipe {
    private UUID id;
    private UUID productId;
    private List<RecipeItem> items;
    private boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    public static Recipe create(UUID productId, List<RecipeItem> items) {
        Instant now = Instant.now();
        return Recipe.builder()
                .id(UUID.randomUUID())
                .productId(productId)
                .items(items)
                .isActive(true)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }
}
