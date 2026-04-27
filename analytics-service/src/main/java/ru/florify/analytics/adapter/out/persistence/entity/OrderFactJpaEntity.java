package ru.florify.analytics.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.florify.analytics.domain.enums.OrderSource;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "analytics_order_facts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderFactJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private UUID orderId;

    @Column(nullable = false)
    private UUID storeId;

    private UUID customerId;
    private UUID assignedEmployeeId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private OrderSource orderSource;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal cogsAmount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal grossProfit;

    private Integer itemCount;

    @Column(nullable = false)
    private Instant completedAt;

    private Instant cancelledAt;
    private String cancellationReason;

    @Column(nullable = false)
    private Instant recordedAt;
}
