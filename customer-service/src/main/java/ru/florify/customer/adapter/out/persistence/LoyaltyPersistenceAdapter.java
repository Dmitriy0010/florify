package ru.florify.customer.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.florify.customer.adapter.out.persistence.entity.LoyaltyAccountJpaEntity;
import ru.florify.customer.adapter.out.persistence.entity.LoyaltyTransactionJpaEntity;
import ru.florify.customer.adapter.out.persistence.mapper.LoyaltyPersistenceMapper;
import ru.florify.customer.adapter.out.persistence.repository.LoyaltyAccountJpaRepository;
import ru.florify.customer.adapter.out.persistence.repository.LoyaltyTransactionJpaRepository;
import ru.florify.customer.application.port.out.LoyaltyAccountRepository;
import ru.florify.customer.application.port.out.LoyaltyTransactionRepository;
import ru.florify.customer.domain.model.LoyaltyAccount;
import ru.florify.customer.domain.model.LoyaltyTransaction;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class LoyaltyPersistenceAdapter implements LoyaltyAccountRepository, LoyaltyTransactionRepository {

    private final LoyaltyAccountJpaRepository accountJpaRepository;
    private final LoyaltyTransactionJpaRepository transactionJpaRepository;
    private final LoyaltyPersistenceMapper mapper;

    @Override
    public LoyaltyAccount save(LoyaltyAccount account) {
        LoyaltyAccountJpaEntity entity = mapper.toJpaEntity(account);
        return mapper.toDomain(accountJpaRepository.save(entity));
    }

    @Override
    public Optional<LoyaltyAccount> findByCustomerId(UUID customerId) {
        return accountJpaRepository.findByCustomerId(customerId).map(mapper::toDomain);
    }

    @Override
    public LoyaltyTransaction save(LoyaltyTransaction tx) {
        LoyaltyTransactionJpaEntity entity = mapper.toJpaEntity(tx);
        return mapper.toDomain(transactionJpaRepository.save(entity));
    }

    @Override
    public List<LoyaltyTransaction> findByLoyaltyAccountId(UUID accountId) {
        return transactionJpaRepository.findByLoyaltyAccountIdOrderByOccurredAtDesc(accountId).stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }

    @Override
    public Optional<LoyaltyTransaction> findActiveReserveByOrderId(UUID orderId) {
        return transactionJpaRepository.findActiveReserveByOrderId(orderId).map(mapper::toDomain);
    }
}
