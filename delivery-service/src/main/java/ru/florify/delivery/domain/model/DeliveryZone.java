package ru.florify.delivery.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Доменная сущность зоны доставки.
 * Справочная мастер-сущность — управляет ценообразованием и минимальным заказом для зоны.
 *
 * Инварианты:
 * - deliveryFee >= 0
 * - minOrderAmount >= 0
 * - deactivate() не удаляет сущность, только устанавливает active=false
 */
@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class DeliveryZone {

    @EqualsAndHashCode.Include
    private UUID id;

    private String name;

    /**
     * GeoJSON-полигон зоны доставки в виде строки.
     * На старте хранится как TEXT. Геовычисления (входит/не входит адрес в зону) — расширение через PostGIS.
     */
    private String polygon;

    private BigDecimal deliveryFee;
    private BigDecimal minOrderAmount;
    private boolean active;
    private Instant createdAt;

    /**
     * Деактивировать зону (soft delete).
     * Деактивированные зоны не отображаются в клиентских списках выбора,
     * но исторические данные задач доставки сохраняются.
     *
     * @return новый экземпляр с active=false
     */
    public DeliveryZone deactivate() {
        return this.toBuilder()
                .active(false)
                .build();
    }
}
