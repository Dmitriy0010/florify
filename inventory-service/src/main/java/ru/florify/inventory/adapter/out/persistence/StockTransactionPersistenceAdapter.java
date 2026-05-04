package ru.florify.inventory.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import ru.florify.inventory.adapter.out.persistence.entity.StockTransactionJpaEntity;
import ru.florify.inventory.adapter.out.persistence.mapper.StockJpaMapper;
import ru.florify.inventory.adapter.out.persistence.repository.StockTransactionJpaRepository;
import ru.florify.inventory.application.port.out.StockTransactionPort;
import ru.florify.inventory.application.query.PagedResult;
import ru.florify.inventory.domain.model.StockTransaction;

import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class StockTransactionPersistenceAdapter implements StockTransactionPort {
    private final StockTransactionJpaRepository repository;
    private final StockJpaMapper mapper;

    @Override
    public void save(StockTransaction transaction) {
        log.debug("Persisting stock transaction: {}", transaction);
        repository.save(mapper.toEntity(transaction));
    }

    @Override
    public boolean existsBySourceDocument(String sourceDocumentId) {
        return repository.existsBySourceDocumentId(sourceDocumentId);
    }
    
    @Override
    public boolean existsBySourceDocumentAndProductId(String sourceDocumentId, UUID productId) {
        return repository.existsBySourceDocumentIdAndProductId(sourceDocumentId, productId);
    }

    @Override
    public PagedResult<StockTransaction> findAllByProductId(UUID productId, int page, int size) {
        log.debug("Fetching transactions for productId: {}, page: {}, size: {}", productId, page, size);
        
        Page<StockTransactionJpaEntity> entityPage = repository.findByProductIdOrderByCreatedAtDesc(
                productId, PageRequest.of(page, size)
        );

        return new PagedResult<>(
                entityPage.getContent().stream().map(mapper::toDomain).collect(Collectors.toList()),
                entityPage.getNumber(),
                entityPage.getSize(),
                entityPage.getTotalElements(),
                entityPage.getTotalPages()
        );
    }

    @Override
    public java.util.Optional<StockTransaction> findById(UUID id) {
        return repository.findById(id).map(mapper::toDomain);
    }
}
