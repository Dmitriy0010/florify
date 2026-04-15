package ru.florify.catalog.application.port.in;

import ru.florify.catalog.application.query.GetCatalogQuery;
import ru.florify.common.application.query.PagedResult;
import ru.florify.catalog.domain.model.Product;

public interface GetCatalogUseCase {
    PagedResult<Product> execute(GetCatalogQuery query);
}
