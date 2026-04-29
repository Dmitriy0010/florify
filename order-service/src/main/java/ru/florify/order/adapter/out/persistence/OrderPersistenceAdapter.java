package ru.florify.order.adapter.out.persistence;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import ru.florify.order.adapter.out.persistence.entity.OrderJpaEntity;
import ru.florify.order.adapter.out.persistence.mapper.OrderJpaMapper;
import ru.florify.order.adapter.out.persistence.mapper.OrderProjectionMapper;
import ru.florify.order.adapter.out.persistence.repository.OrderJpaRepository;
import ru.florify.order.application.port.out.OrderRepository;
import ru.florify.order.domain.model.Order;
import ru.florify.order.domain.model.OrderKanbanItem;
import ru.florify.order.domain.model.OrderStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderPersistenceAdapter implements OrderRepository {

    private final OrderJpaRepository repository;
    private final OrderJpaMapper mapper;
    private final OrderProjectionMapper projectionMapper;

    @Override
    public Order save(Order order) {
        OrderJpaEntity entity = mapper.toEntity(order);
        OrderJpaEntity saved = repository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Order> findById(UUID id) {
        return repository.findByIdWithItems(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Order> findByIdWithItems(UUID id) {
        return repository.findByIdWithItems(id).map(mapper::toDomain);
    }

    @Override
    public List<OrderKanbanItem> findKanbanByStatus(OrderStatus status, int limit) {
        return repository.findKanbanByStatus(status, PageRequest.of(0, limit))
                .stream()
                .map(projectionMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByCustomerId(UUID customerId) {
        return repository.findByCustomerId(customerId).stream()
                .map(mapper::toDomainWithoutItems)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByFloristId(UUID floristId) {
        return repository.findByFloristId(floristId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findRecent(int limit) {
        return repository.findAllOrderByCreatedAtDesc(PageRequest.of(0, limit)).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
