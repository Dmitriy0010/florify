package ru.florify.delivery.adapter.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.florify.delivery.domain.model.TaskStatus;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "delivery_tasks",
        indexes = {
                @Index(name = "idx_delivery_task_order_id", columnList = "order_id", unique = true),
                @Index(name = "idx_delivery_task_courier_id", columnList = "courier_id"),
                @Index(name = "idx_delivery_task_status", columnList = "status"),
                @Index(name = "idx_delivery_task_slot_id", columnList = "slot_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DeliveryTaskJpaEntity {

    @Id
    @EqualsAndHashCode.Include
    private UUID id;

    /** Уникальный внешний ключ на order-service (один заказ — одна задача). */
    @Column(name = "order_id", nullable = false, unique = true)
    private UUID orderId;

    @Column(name = "slot_id")
    private UUID slotId;

    @Column(name = "zone_id")
    private UUID zoneId;

    @Column(name = "courier_id")
    private UUID courierId;

    @Column(name = "delivery_address", nullable = false, columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TaskStatus status;

    @Column(name = "estimated_arrival")
    private Instant estimatedArrival;

    @Column(name = "actual_delivered_at")
    private Instant actualDeliveredAt;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
