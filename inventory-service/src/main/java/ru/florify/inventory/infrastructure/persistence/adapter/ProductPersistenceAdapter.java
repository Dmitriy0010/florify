package ru.florify.inventory.infrastructure.persistence.adapter;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import ru.florify.inventory.domain.exception.NotFoundException;
import ru.florify.inventory.domain.model.Product;
import ru.florify.inventory.domain.port.out.ProductLookupPort;
import ru.florify.inventory.domain.port.out.ProductPersistPort;
import ru.florify.inventory.infrastructure.persistence.entity.ProductJpaEntity;
import ru.florify.inventory.infrastructure.persistence.repository.ProductJpaRepository;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProductPersistenceAdapter implements ProductLookupPort, ProductPersistPort {
    private final ProductJpaRepository repository;

    @Override
    public Optional<Product> findActiveById(UUID id) {
        return repository.findByIdAndActiveTrue(id).map(this::mapToDomain);
    }

    @Override
    public Optional<Product> findById(UUID id) {
        return repository.findById(id).map(this::mapToDomain);
    }

    @Override
    public Optional<Product> findBySkuIncludingInactive(String sku) {
        return repository.findBySku(sku).map(this::mapToDomain);
    }

    @Override
    public Page<Product> findAllActive(Pageable pageable) {
        return repository.findAllByActiveTrue(pageable).map(this::mapToDomain);
    }

    @Override
    public Product save(Product product) {
        ProductJpaEntity entity = mapToEntity(product);
        return mapToDomain(repository.save(entity));
    }

    @Override
    public void deactivate(UUID id) {
        ProductJpaEntity entity = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));
        entity.setActive(false);
        repository.save(entity);
    }

    private Product mapToDomain(ProductJpaEntity entity) {
        return new Product(
                entity.getId(),
                entity.getName(),
                entity.getSku(),
                entity.getCategory(),
                entity.getUnit(),
                entity.getRetailPrice(),
                entity.isActive(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    private ProductJpaEntity mapToEntity(Product product) {
        return ProductJpaEntity.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .category(product.getCategory())
                .unit(product.getUnit())
                .retailPrice(product.getRetailPrice())
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
