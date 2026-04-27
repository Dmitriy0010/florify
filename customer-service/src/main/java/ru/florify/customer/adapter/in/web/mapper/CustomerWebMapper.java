package ru.florify.customer.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;
import ru.florify.customer.adapter.in.web.dto.CustomerResponse;
import ru.florify.customer.adapter.in.web.dto.CustomerSummaryResponse;
import ru.florify.customer.adapter.in.web.dto.PagedResponse;
import ru.florify.common.application.query.PagedResult;
import ru.florify.customer.adapter.in.web.dto.CreateCustomerRequest;
import ru.florify.customer.application.command.CreateCustomerCommand;
import ru.florify.customer.application.port.out.LoyaltyAccountRepository;
import ru.florify.customer.domain.enums.CustomerSource;
import ru.florify.customer.domain.model.Customer;
import ru.florify.customer.domain.model.LoyaltyAccount;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public abstract class CustomerWebMapper {

    @Autowired
    protected LoyaltyAccountRepository loyaltyAccountRepository;

    public abstract CustomerResponse toResponse(Customer domain);

    @Mapping(target = "loyaltyPoints", expression = "java(getLoyaltyPoints(domain.getId()))")
    public abstract CustomerSummaryResponse toSummaryResponse(Customer domain);
    
    @Mapping(target = "source", source = "source")
    @Mapping(target = "userId", ignore = true)
    public abstract CreateCustomerCommand toCommand(CreateCustomerRequest request, CustomerSource source);

    protected Integer getLoyaltyPoints(java.util.UUID customerId) {
        return loyaltyAccountRepository.findByCustomerId(customerId)
                .map(LoyaltyAccount::getPointsBalance)
                .orElse(0);
    }

    public PagedResponse<CustomerSummaryResponse> toPagedResponse(PagedResult<Customer> result) {
        List<CustomerSummaryResponse> content = result.data().stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
        return PagedResponse.of(content, result.page(), result.size(), result.totalElements());
    }
}
