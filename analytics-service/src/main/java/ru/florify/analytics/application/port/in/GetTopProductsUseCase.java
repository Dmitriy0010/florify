package ru.florify.analytics.application.port.in;

import ru.florify.analytics.application.query.TopProductsQuery;
import ru.florify.analytics.application.result.TopProductsResult;

public interface GetTopProductsUseCase {
    TopProductsResult getTopProducts(TopProductsQuery query);
}
