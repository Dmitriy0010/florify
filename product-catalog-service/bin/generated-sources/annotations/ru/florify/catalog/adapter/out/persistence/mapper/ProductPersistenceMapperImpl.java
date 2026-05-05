package ru.florify.catalog.adapter.out.persistence.mapper;

import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.catalog.adapter.out.persistence.entity.ProductCategoryJpaEntity;
import ru.florify.catalog.adapter.out.persistence.entity.ProductJpaEntity;
import ru.florify.catalog.domain.model.Product;
import ru.florify.catalog.domain.model.ProductCategory;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:55+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ProductPersistenceMapperImpl implements ProductPersistenceMapper {

    @Override
    public Product toDomain(ProductJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        Product.ProductBuilder product = Product.builder();

        product.categoryId( entityCategoryId( entity ) );
        product.active( entity.isActive() );
        product.createdAt( entity.getCreatedAt() );
        product.currentPrice( entity.getCurrentPrice() );
        product.defaultShelfLifeDays( entity.getDefaultShelfLifeDays() );
        product.description( entity.getDescription() );
        product.id( entity.getId() );
        product.imageUrl( entity.getImageUrl() );
        product.name( entity.getName() );
        product.sku( entity.getSku() );
        product.unit( entity.getUnit() );
        product.updatedAt( entity.getUpdatedAt() );

        return product.build();
    }

    @Override
    public ProductJpaEntity toEntity(Product domain) {
        if ( domain == null ) {
            return null;
        }

        ProductJpaEntity.ProductJpaEntityBuilder productJpaEntity = ProductJpaEntity.builder();

        productJpaEntity.active( domain.isActive() );
        productJpaEntity.createdAt( domain.getCreatedAt() );
        productJpaEntity.currentPrice( domain.getCurrentPrice() );
        productJpaEntity.defaultShelfLifeDays( domain.getDefaultShelfLifeDays() );
        productJpaEntity.description( domain.getDescription() );
        productJpaEntity.id( domain.getId() );
        productJpaEntity.imageUrl( domain.getImageUrl() );
        productJpaEntity.name( domain.getName() );
        productJpaEntity.sku( domain.getSku() );
        productJpaEntity.unit( domain.getUnit() );
        productJpaEntity.updatedAt( domain.getUpdatedAt() );

        return productJpaEntity.build();
    }

    @Override
    public ProductCategory toDomain(ProductCategoryJpaEntity entity) {
        if ( entity == null ) {
            return null;
        }

        ProductCategory.ProductCategoryBuilder productCategory = ProductCategory.builder();

        productCategory.active( entity.isActive() );
        productCategory.createdAt( entity.getCreatedAt() );
        productCategory.description( entity.getDescription() );
        productCategory.id( entity.getId() );
        productCategory.name( entity.getName() );
        productCategory.updatedAt( entity.getUpdatedAt() );

        return productCategory.build();
    }

    @Override
    public ProductCategoryJpaEntity toEntity(ProductCategory domain) {
        if ( domain == null ) {
            return null;
        }

        ProductCategoryJpaEntity.ProductCategoryJpaEntityBuilder productCategoryJpaEntity = ProductCategoryJpaEntity.builder();

        productCategoryJpaEntity.active( domain.isActive() );
        productCategoryJpaEntity.createdAt( domain.getCreatedAt() );
        productCategoryJpaEntity.description( domain.getDescription() );
        productCategoryJpaEntity.id( domain.getId() );
        productCategoryJpaEntity.name( domain.getName() );
        productCategoryJpaEntity.updatedAt( domain.getUpdatedAt() );

        return productCategoryJpaEntity.build();
    }

    private UUID entityCategoryId(ProductJpaEntity productJpaEntity) {
        ProductCategoryJpaEntity category = productJpaEntity.getCategory();
        if ( category == null ) {
            return null;
        }
        return category.getId();
    }
}
