package ru.florify.catalog.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.catalog.application.port.in.GetCatalogUseCase;
import ru.florify.catalog.application.port.out.ProductRepository;
import ru.florify.catalog.application.query.GetCatalogQuery;
import ru.florify.catalog.domain.model.Product;
import ru.florify.common.application.query.PagedResult;

import ru.florify.common.application.port.ProductAvailabilityPort;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GetCatalogInteractor implements GetCatalogUseCase {

    private final ProductRepository productRepository;
    private final ProductAvailabilityPort productAvailabilityPort;

    @Override
    @Transactional(readOnly = true)
    public PagedResult<Product> execute(GetCatalogQuery query) {
        log.info("Executing getCatalog for store: {}, category: {}", query.storeId(), query.categoryId());
        
        if (query.storeId() != null) {
            List<UUID> availableProductIds = productAvailabilityPort.getAvailableProductIds(query.storeId());
            log.info("Catalog received {} available product IDs from Inventory for store {}", 
                    availableProductIds.size(), query.storeId());
            
            PagedResult<Product> result = productRepository.findAllWithIds(query, availableProductIds);
            log.info("Catalog found {} products matching IDs in repository", result.totalElements());
            return result;
        }
        
        return productRepository.findAll(query);
    }
}

