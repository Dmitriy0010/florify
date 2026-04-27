package ru.florify.supplier.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import ru.florify.common.application.query.PagedResult;
import ru.florify.supplier.adapter.out.persistence.mapper.SupplierPersistenceMapper;
import ru.florify.supplier.adapter.out.persistence.repository.SupplierJpaRepository;
import ru.florify.supplier.application.port.out.SupplierRepository;
import ru.florify.supplier.domain.model.Supplier;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SupplierPersistenceAdapter implements SupplierRepository {

    private final SupplierJpaRepository jpaRepository;
    private final SupplierPersistenceMapper mapper;

    @Override
    public Supplier save(Supplier supplier) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(supplier)));
    }

    @Override
    public Optional<Supplier> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public PagedResult<Supplier> findAll(String search, Boolean active, int page, int size) {
        String searchPattern = (search == null || search.isBlank()) ? null : "%" + search.toLowerCase() + "%";
        var pg = jpaRepository.findAllWithFilters(searchPattern, active, PageRequest.of(page, size));
        return new PagedResult<>(pg.getContent().stream().map(mapper::toDomain).toList(), page, size, pg.getTotalElements());
    }

    @Override
    public boolean existsByTaxId(String taxId) {
        return jpaRepository.existsByTaxId(taxId);
    }
}
