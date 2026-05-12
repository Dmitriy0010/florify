package ru.florify.inventory.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.inventory.adapter.out.persistence.entity.ProductCatalogJpaEntity;
import ru.florify.inventory.adapter.out.persistence.repository.ProductCatalogJpaRepository;
import ru.florify.inventory.application.port.out.ProductLookupPort;
import ru.florify.inventory.domain.model.CatalogProduct;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProductCatalogLookupAdapter implements ProductLookupPort {

    private final ProductCatalogJpaRepository repository;

    @Override
    public Optional<CatalogProduct> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public java.util.List<CatalogProduct> findAll() {
        return repository.findAll().stream()
                .map(this::toDomain)
                .collect(java.util.stream.Collectors.toList());
    }

    private CatalogProduct toDomain(ProductCatalogJpaEntity e) {
        return CatalogProduct.builder()
                .productId(e.getId())
                .name(e.getName())
                .sku(e.getSku())
                .unit(e.getUnit())
                .defaultShelfLifeDays(e.getDefaultShelfLifeDays())
                .active(e.isActive())
                .imageUrl(e.getImageUrl())
                .build();
    }
}
