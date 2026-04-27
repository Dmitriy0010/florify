package ru.florify.catalog.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import ru.florify.catalog.adapter.out.persistence.entity.ProductCategoryJpaEntity;
import ru.florify.catalog.adapter.out.persistence.entity.ProductJpaEntity;
import ru.florify.catalog.adapter.out.persistence.mapper.ProductPersistenceMapper;
import ru.florify.catalog.adapter.out.persistence.repository.CategoryJpaRepository;
import ru.florify.catalog.adapter.out.persistence.repository.ProductJpaRepository;
import ru.florify.catalog.application.port.out.CategoryRepository;
import ru.florify.catalog.application.port.out.ProductRepository;
import ru.florify.catalog.application.query.GetCatalogQuery;
import ru.florify.catalog.domain.model.Product;
import ru.florify.catalog.domain.model.ProductCategory;
import ru.florify.common.application.query.PagedResult;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductPersistenceAdapter implements ProductRepository, CategoryRepository {

    private final ProductJpaRepository productJpaRepository;
    private final CategoryJpaRepository categoryJpaRepository;
    private final ProductPersistenceMapper mapper;

    // ProductRepository
    @Override
    public Product save(Product product) {
        ProductCategoryJpaEntity categoryEntity = categoryJpaRepository.findById(product.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + product.getCategoryId()));

        ProductJpaEntity entity = mapper.toEntity(product);
        entity.setCategory(categoryEntity);
        return mapper.toDomain(productJpaRepository.save(entity));
    }

    @Override
    public Optional<Product> findById(UUID id) {
        return productJpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Product> findBySku(String sku) {
        return productJpaRepository.findBySku(sku).map(mapper::toDomain);
    }

    @Override
    public PagedResult<Product> findAll(GetCatalogQuery query) {
        Specification<ProductJpaEntity> spec = Specification.where(null);

        if (query.categoryId() != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("category").get("id"), query.categoryId()));
        }
        if (query.active() != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("active"), query.active()));
        }
        if (query.searchTerm() != null && !query.searchTerm().isBlank()) {
            String term = "%" + query.searchTerm().toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), term),
                cb.like(cb.lower(root.get("sku")), term)
            ));
        }

        Page<ProductJpaEntity> page = productJpaRepository.findAll(spec, PageRequest.of(query.page(), query.size()));

        return new PagedResult<>(
            page.getContent().stream().map(mapper::toDomain).collect(Collectors.toList()),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements()
        );
    }

    @Override
    public List<Product> findByCategoryId(UUID categoryId) {
        return productJpaRepository.findByCategoryId(categoryId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsBySku(String sku) {
        return productJpaRepository.existsBySku(sku);
    }

    // CategoryRepository
    @Override
    public Optional<ProductCategory> findCategoryById(UUID id) {
        return categoryJpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<ProductCategory> findAllActive() {
        return categoryJpaRepository.findByActiveTrue().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public ProductCategory save(ProductCategory category) {
        return mapper.toDomain(categoryJpaRepository.save(mapper.toEntity(category)));
    }
}
