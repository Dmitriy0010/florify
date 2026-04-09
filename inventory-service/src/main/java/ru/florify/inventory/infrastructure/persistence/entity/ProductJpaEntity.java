package ru.florify.inventory.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.florify.inventory.domain.model.ProductCategory;
import ru.florify.inventory.domain.model.UnitOfMeasure;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "products", schema = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductJpaEntity {
    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String sku;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UnitOfMeasure unit;

    @Column(nullable = false)
    private BigDecimal retailPrice;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
