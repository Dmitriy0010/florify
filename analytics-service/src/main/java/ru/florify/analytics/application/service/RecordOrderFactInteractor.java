package ru.florify.analytics.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.application.command.RecordOrderFactCommand;
import ru.florify.analytics.application.port.in.RecordOrderFactUseCase;
import ru.florify.analytics.application.port.out.AnalyticsCachePort;
import ru.florify.analytics.application.port.out.OrderFactRepository;
import ru.florify.analytics.domain.model.OrderFact;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecordOrderFactInteractor implements RecordOrderFactUseCase {
    private final OrderFactRepository repository;
    private final AnalyticsCachePort cachePort;

    @Override
    @Transactional
    public synchronized void record(RecordOrderFactCommand cmd) {
        repository.findByOrderId(cmd.orderId()).ifPresentOrElse(
            fact -> updateExisting(fact, cmd),
            () -> createNew(cmd)
        );
    }

    private void updateExisting(OrderFact fact, RecordOrderFactCommand cmd) {
        // If fact exists, only update status and completion time if it's currently becoming COMPLETED
        fact.setStatus(cmd.status());
        if ("COMPLETED".equals(cmd.status())) {
            fact.setCompletedAt(cmd.completedAt());
        }
        repository.update(fact);
        cachePort.evictDashboard();
    }

    private void createNew(RecordOrderFactCommand cmd) {
        OrderFact fact = OrderFact.builder()
            .orderId(cmd.orderId())
            .storeId(cmd.storeId())
            .customerId(cmd.customerId())
            .assignedEmployeeId(cmd.assignedEmployeeId())
            .orderSource(cmd.orderSource())
            .status(cmd.status())
            .totalAmount(cmd.totalAmount() != null ? cmd.totalAmount() : BigDecimal.ZERO)
            .cogsAmount(BigDecimal.ZERO)
            .grossProfit(cmd.totalAmount() != null ? cmd.totalAmount() : BigDecimal.ZERO)
            .itemCount(cmd.itemCount() != null ? cmd.itemCount() : 0)
            .completedAt(cmd.completedAt())
            .recordedAt(Instant.now())
            .build();
        repository.save(fact);
        cachePort.evictDashboard();
    }
}
