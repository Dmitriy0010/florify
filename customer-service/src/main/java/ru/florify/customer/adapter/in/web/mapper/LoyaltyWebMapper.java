package ru.florify.customer.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.customer.adapter.in.web.dto.LoyaltyAccountResponse;
import ru.florify.customer.adapter.in.web.dto.LoyaltyTransactionResponse;
import ru.florify.customer.domain.model.LoyaltyAccount;
import ru.florify.customer.domain.model.LoyaltyTransaction;

@Mapper(componentModel = "spring")
public interface LoyaltyWebMapper {

    @Mapping(target = "availablePoints", expression = "java(domain.availablePoints())")
    LoyaltyAccountResponse toResponse(LoyaltyAccount domain);

    LoyaltyTransactionResponse toResponse(LoyaltyTransaction domain);
}
