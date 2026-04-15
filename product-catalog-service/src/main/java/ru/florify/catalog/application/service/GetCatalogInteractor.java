package ru.florify.catalog.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.catalog.application.port.in.GetCatalogUseCase;
import ru.florify.catalog.application.port.out.ProductRepository;
import ru.florify.catalog.application.query.GetCatalogQuery;
import ru.florify.catalog.domain.model.Product;
import ru.florify.common.application.query.PagedResult;

@Service
@RequiredArgsConstructor
public class GetCatalogInteractor implements GetCatalogUseCase {

    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResult<Product> execute(GetCatalogQuery query) {
        return productRepository.findAll(query);
    }
}
