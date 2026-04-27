package ru.florify.delivery.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.florify.delivery.adapter.out.persistence.entity.DeliveryZoneJpaEntity;

import java.util.List;
import java.util.UUID;

public interface DeliveryZoneJpaRepository extends JpaRepository<DeliveryZoneJpaEntity, UUID> {

    List<DeliveryZoneJpaEntity> findAllByActiveTrue();

    boolean existsByNameIgnoreCase(String name);
}
