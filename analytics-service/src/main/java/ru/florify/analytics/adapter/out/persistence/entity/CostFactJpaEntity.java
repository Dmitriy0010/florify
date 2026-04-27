package ru.florify.analytics.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.florify.analytics.domain.enums.WriteoffReason;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "analytics_cost_facts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CostFactJpaEntity {
    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CostFactType costType;

    @Column(nullable = false)
    private UUID sourceRefId;

    @Column(nullable = false)
    private UUID storeId;

    @Column(nullable = false)
    private Instant occurredAt;

    @Column(nullable = false)
    private Instant recordedAt;

    @Column(precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(precision = 19, scale = 2)
    private BigDecimal quantity;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private WriteoffReason reason;

    private UUID supplierId;
    private String supplierName;
    private Integer itemCount;

    private UUID employeeId;
    private String employeeName;
    private String employeeRole;
    private LocalDate periodStart;
    private LocalDate periodEnd;

    private UUID productId;
    private String productName;
    private UUID categoryId;
    private String categoryName;
}
