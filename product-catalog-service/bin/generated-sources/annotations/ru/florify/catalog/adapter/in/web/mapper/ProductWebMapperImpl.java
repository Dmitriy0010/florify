package ru.florify.catalog.adapter.in.web.mapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.catalog.adapter.in.web.dto.ProductResponse;
import ru.florify.catalog.adapter.in.web.dto.ProductSummaryResponse;
import ru.florify.catalog.domain.model.Product;
import ru.florify.common.domain.enums.UnitOfMeasure;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-27T12:25:58+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ProductWebMapperImpl implements ProductWebMapper {

    @Override
    public ProductResponse toResponse(Product domain) {
        if ( domain == null ) {
            return null;
        }

        UUID id = null;
        String sku = null;
        String name = null;
        String description = null;
        UUID categoryId = null;
        UnitOfMeasure unit = null;
        BigDecimal currentPrice = null;
        String imageUrl = null;
        int defaultShelfLifeDays = 0;
        boolean active = false;
        int version = 0;
        Instant createdAt = null;
        Instant updatedAt = null;

        id = domain.getId();
        sku = domain.getSku();
        name = domain.getName();
        description = domain.getDescription();
        categoryId = domain.getCategoryId();
        unit = domain.getUnit();
        currentPrice = domain.getCurrentPrice();
        imageUrl = domain.getImageUrl();
        defaultShelfLifeDays = domain.getDefaultShelfLifeDays();
        active = domain.isActive();
        version = domain.getVersion();
        createdAt = domain.getCreatedAt();
        updatedAt = domain.getUpdatedAt();

        ProductResponse productResponse = new ProductResponse( id, sku, name, description, categoryId, unit, currentPrice, imageUrl, defaultShelfLifeDays, active, version, createdAt, updatedAt );

        return productResponse;
    }

    @Override
    public ProductSummaryResponse toSummaryResponse(Product domain) {
        if ( domain == null ) {
            return null;
        }

        UUID id = null;
        String sku = null;
        String name = null;
        BigDecimal currentPrice = null;
        String imageUrl = null;
        boolean active = false;

        id = domain.getId();
        sku = domain.getSku();
        name = domain.getName();
        currentPrice = domain.getCurrentPrice();
        imageUrl = domain.getImageUrl();
        active = domain.isActive();

        ProductSummaryResponse productSummaryResponse = new ProductSummaryResponse( id, sku, name, currentPrice, imageUrl, active );

        return productSummaryResponse;
    }
}
