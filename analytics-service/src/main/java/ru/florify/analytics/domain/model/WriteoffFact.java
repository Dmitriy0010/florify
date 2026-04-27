package ru.florify.analytics.domain.model;

import lombok.*;
import ru.florify.analytics.domain.enums.WriteoffReason;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class WriteoffFact {
    @EqualsAndHashCode.Include
    private UUID id;
    private UUID sourceEventId; // Unique for idempotency
    private UUID productId;
    private UUID storeId;
    private String productName;
    private UUID categoryId;
    private String categoryName;
    private BigDecimal quantity;
    private WriteoffReason reason;
    private Instant writtenOffAt;
    private Instant recordedAt;
}
