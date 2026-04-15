package ru.florify.catalog.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import ru.florify.catalog.adapter.in.web.dto.ProductResponse;
import ru.florify.catalog.adapter.in.web.dto.ProductSummaryResponse;
import ru.florify.catalog.domain.model.Product;
import ru.florify.common.application.query.PagedResult;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProductWebMapper {

    ProductResponse toResponse(Product domain);

    ProductSummaryResponse toSummaryResponse(Product domain);

    default PagedResult<ProductResponse> toPagedResponse(PagedResult<Product> pagedDomain) {
        List<ProductResponse> data = pagedDomain.data().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return new PagedResult<>(
                data,
                pagedDomain.page(),
                pagedDomain.size(),
                pagedDomain.totalElements()
        );
    }
}
