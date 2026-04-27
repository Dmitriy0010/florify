package ru.florify.customer.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import ru.florify.customer.adapter.out.persistence.entity.CustomerJpaEntity;
import ru.florify.customer.adapter.out.persistence.mapper.CustomerPersistenceMapper;
import ru.florify.customer.adapter.out.persistence.repository.CustomerJpaRepository;
import ru.florify.customer.application.port.out.CustomerRepository;
import ru.florify.customer.application.query.GetCustomerListQuery;
import ru.florify.common.application.query.PagedResult;
import ru.florify.customer.domain.model.Customer;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CustomerPersistenceAdapter implements CustomerRepository {

    private final CustomerJpaRepository customerJpaRepository;
    private final CustomerPersistenceMapper mapper;

    @Override
    public Customer save(Customer customer) {
        CustomerJpaEntity entity = mapper.toJpaEntity(customer);
        CustomerJpaEntity savedEntity = customerJpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Customer> findById(UUID id) {
        return customerJpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Customer> findByPhone(String phone) {
        return customerJpaRepository.findByPhoneAndActiveTrue(phone).map(mapper::toDomain);
    }

    @Override
    public Optional<Customer> findByUserId(UUID userId) {
        return customerJpaRepository.findByUserId(userId).map(mapper::toDomain);
    }

    @Override
    public PagedResult<Customer> findAll(GetCustomerListQuery query, boolean includeArchived) {
        Page<CustomerJpaEntity> page = customerJpaRepository.findAllWithFilters(
                query.searchTerm(),
                query.tier(),
                includeArchived,
                PageRequest.of(query.page(), query.size())
        );

        return new PagedResult<>(
            page.getContent().stream().map(mapper::toDomain).collect(Collectors.toList()),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements()
        );
    }

    @Override
    public List<Customer> findByBirthMonthAndDay(int month, int day) {
        return customerJpaRepository.findByBirthMonthAndDay(month, day).stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }
}
