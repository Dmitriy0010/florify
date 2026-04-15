package ru.florify.catalog.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.catalog.application.port.in.GetProductByIdUseCase;
import ru.florify.catalog.application.port.out.ProductCachePort;
import ru.florify.catalog.application.port.out.ProductRepository;
import ru.florify.catalog.domain.exception.ProductNotFoundException;
import ru.florify.catalog.domain.model.Product;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetProductByIdInteractor implements GetProductByIdUseCase {

    private final ProductRepository productRepository;
    private final ProductCachePort cachePort;

    @Override
    @Transactional(readOnly = true)
    public Product execute(UUID productId) {
        return cachePort.get(productId).orElseGet(() -> {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ProductNotFoundException(productId));
            cachePort.put(productId, product);
            return product;
        });
    }
}
