package ru.florify.analytics.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.application.command.CancelOrderFactCommand;
import ru.florify.analytics.application.port.in.CancelOrderFactUseCase;
import ru.florify.analytics.application.port.out.AnalyticsCachePort;
import ru.florify.analytics.application.port.out.OrderFactRepository;

@Service
@RequiredArgsConstructor
public class CancelOrderFactInteractor implements CancelOrderFactUseCase {
    private final OrderFactRepository repository;
    private final AnalyticsCachePort cachePort;

    @Override
    @Transactional
    public void cancel(CancelOrderFactCommand cmd) {
        repository.findByOrderId(cmd.orderId()).ifPresent(fact -> {
            fact.setStatus("CANCELLED");
            fact.setCancelledAt(cmd.cancelledAt());
            fact.setCancellationReason(cmd.cancellationReason());
            repository.update(fact);
            cachePort.evictDashboard();
        });
    }
}
