package ru.florify.order.adapter.out.persistence.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.florify.order.adapter.out.persistence.entity.OrderJpaEntity;
import ru.florify.order.domain.model.OrderStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, UUID> {
    @EntityGraph(attributePaths = {"items"})
    @Query("SELECT o FROM OrderJpaEntity o WHERE o.id = :id")
    Optional<OrderJpaEntity> findByIdWithItems(@Param("id") UUID id);


    @Query("SELECT o.id as id, o.orderNumber as orderNumber, o.status as status, " +
           "o.finalAmount as finalAmount, o.createdAt as createdAt, " +
           "o.guestName as guestName, o.guestPhone as guestPhone, " +
           "o.type as type, o.source as source, " +
           "o.isPaid as isPaid " +
           "FROM OrderJpaEntity o " +
           "WHERE o.status = :status ORDER BY o.createdAt DESC")
    List<OrderKanbanProjection> findKanbanByStatus(@Param("status") OrderStatus status, Pageable pageable);

    List<OrderJpaEntity> findByCustomerId(@Param("customerId") UUID customerId);
    List<OrderJpaEntity> findByFloristId(@Param("floristId") UUID floristId);
}
