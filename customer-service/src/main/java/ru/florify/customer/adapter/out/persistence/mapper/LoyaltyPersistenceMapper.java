package ru.florify.customer.adapter.out.persistence.mapper;

import org.mapstruct.Mapper;
import ru.florify.customer.adapter.out.persistence.entity.LoyaltyAccountJpaEntity;
import ru.florify.customer.adapter.out.persistence.entity.LoyaltyTransactionJpaEntity;
import ru.florify.customer.domain.model.LoyaltyAccount;
import ru.florify.customer.domain.model.LoyaltyTransaction;

@Mapper(componentModel = "spring")
public interface LoyaltyPersistenceMapper {

    LoyaltyAccount toDomain(LoyaltyAccountJpaEntity entity);
    LoyaltyAccountJpaEntity toJpaEntity(LoyaltyAccount domain);

    LoyaltyTransaction toDomain(LoyaltyTransactionJpaEntity entity);
    LoyaltyTransactionJpaEntity toJpaEntity(LoyaltyTransaction domain);
}
