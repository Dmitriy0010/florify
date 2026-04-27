package ru.florify.catalog.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.catalog.adapter.out.persistence.entity.ProductCategoryJpaEntity;
import ru.florify.catalog.adapter.out.persistence.entity.ProductJpaEntity;
import ru.florify.catalog.domain.model.Product;
import ru.florify.catalog.domain.model.ProductCategory;

@Mapper(componentModel = "spring")
public interface ProductPersistenceMapper {

    @Mapping(target = "categoryId", source = "category.id")
    Product toDomain(ProductJpaEntity entity);

    @Mapping(target = "category", ignore = true) // Handled by repository lookup in adapter
    ProductJpaEntity toEntity(Product domain);

    ProductCategory toDomain(ProductCategoryJpaEntity entity);

    ProductCategoryJpaEntity toEntity(ProductCategory domain);
}
