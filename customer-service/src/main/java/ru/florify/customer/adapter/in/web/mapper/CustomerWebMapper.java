package ru.florify.customer.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.customer.adapter.in.web.dto.CustomerResponse;
import ru.florify.customer.adapter.in.web.dto.CustomerSummaryResponse;
import ru.florify.customer.adapter.in.web.dto.PagedResponse;
import ru.florify.common.application.query.PagedResult;
import ru.florify.customer.domain.model.Customer;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface CustomerWebMapper {

    CustomerResponse toResponse(Customer domain);

    CustomerSummaryResponse toSummaryResponse(Customer domain);

    ru.florify.customer.adapter.in.web.dto.CustomerEventResponse toResponse(ru.florify.customer.domain.model.CustomerEvent domain);

    default PagedResponse<CustomerSummaryResponse> toPagedResponse(PagedResult<Customer> result) {
        List<CustomerSummaryResponse> content = result.data().stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
        return PagedResponse.of(content, result.page(), result.size(), result.totalElements());
    }
}
