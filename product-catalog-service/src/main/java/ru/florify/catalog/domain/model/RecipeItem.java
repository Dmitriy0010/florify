package ru.florify.catalog.domain.model;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecipeItem {
    private UUID id;
    private UUID ingredientId;
    private BigDecimal quantity;
}
