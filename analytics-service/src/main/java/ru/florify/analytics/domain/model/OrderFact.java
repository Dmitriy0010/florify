package ru.florify.analytics.domain.model;

import lombok.*;
import ru.florify.analytics.domain.enums.OrderSource;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class OrderFact {
    @EqualsAndHashCode.Include
    private UUID orderId; // Unique for idempotency
    private UUID storeId;
    private UUID customerId;
    private UUID assignedEmployeeId;
    private OrderSource orderSource;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal cogsAmount;
    private BigDecimal grossProfit; // totalAmount - cogsAmount
    private Integer itemCount;
    private Instant completedAt;
    private Instant cancelledAt;
    private String cancellationReason;
    private Instant recordedAt;

    public void applyCogsUpdate(BigDecimal cogs) {
        this.cogsAmount = cogs;
        if (this.totalAmount != null) {
            this.grossProfit = this.totalAmount.subtract(cogs);
        }
    }
}
