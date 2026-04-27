package ru.florify.order.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.florify.order.domain.model.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OrderJpaEntity {

    @Id
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "order_number", unique = true, nullable = false, length = 20)
    private String orderNumber;

    @Column(name = "idempotency_key", length = 64)
    private String idempotencyKey;

    @Column(name = "customer_id", nullable = true)
    private UUID customerId;

    @Column(name = "guest_phone", length = 20)
    private String guestPhone;

    @Column(name = "guest_name", length = 100)
    private String guestName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItemJpaEntity> items;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "discount_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "bonus_points_used", nullable = false, precision = 10, scale = 2)
    private BigDecimal bonusPointsUsed;

    @Column(name = "final_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalAmount;

    @Column(name = "total_cogs", precision = 10, scale = 2)
    private BigDecimal totalCogs;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderSource source;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "florist_id")
    private UUID floristId;

    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "delivery_slot_id")
    private UUID deliverySlotId;

    @Column(name = "delivery_zone_id")
    private UUID deliveryZoneId;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "current_payment_id", referencedColumnName = "id")
    private PaymentEntity currentPayment;
}
