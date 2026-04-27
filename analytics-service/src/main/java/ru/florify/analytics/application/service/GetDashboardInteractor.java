package ru.florify.analytics.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.application.port.in.GetDashboardUseCase;
import ru.florify.analytics.application.result.DashboardResult;
import ru.florify.analytics.adapter.out.persistence.repository.OrderFactJpaRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetDashboardInteractor implements GetDashboardUseCase {
    private final OrderFactJpaRepository orderFactRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResult getDashboard(UUID storeId, Instant from, Instant to) {
        long totalOrders = orderFactRepository.countOrders(storeId, from, to);
        BigDecimal totalRevenue = orderFactRepository.sumRevenue(storeId, from, to);
        long cancelledOrders = orderFactRepository.countCancelledOrders(storeId, from, to);
        
        BigDecimal averageCheck = totalOrders > 0 
            ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
            
        return new DashboardResult(
            totalOrders,
            totalRevenue,
            averageCheck,
            cancelledOrders,
            BigDecimal.ZERO // Writeoff placeholder for future implementation
        );
    }
}
