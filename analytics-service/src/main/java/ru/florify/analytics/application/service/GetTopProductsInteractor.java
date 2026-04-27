package ru.florify.analytics.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.application.port.in.GetTopProductsUseCase;
import ru.florify.analytics.application.port.out.OrderFactRepository;
import ru.florify.analytics.application.query.TopProductsQuery;
import ru.florify.analytics.application.result.TopProductsResult;

@Service
@RequiredArgsConstructor
public class GetTopProductsInteractor implements GetTopProductsUseCase {
    private final OrderFactRepository repository;

    @Override
    @Transactional(readOnly = true)
    public TopProductsResult getTopProducts(TopProductsQuery query) {
        return new TopProductsResult(repository.findTopProducts(query.from(), query.to(), query.limit()));
    }
}
