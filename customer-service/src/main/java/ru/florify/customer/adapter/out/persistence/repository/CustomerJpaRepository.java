package ru.florify.customer.adapter.out.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.florify.customer.adapter.out.persistence.entity.CustomerJpaEntity;
import ru.florify.customer.adapter.out.persistence.entity.LoyaltyAccountJpaEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerJpaRepository extends JpaRepository<CustomerJpaEntity, UUID> {

    Optional<CustomerJpaEntity> findByPhoneAndActiveTrue(String phone);

    @Query("""
        SELECT c FROM CustomerJpaEntity c 
        LEFT JOIN LoyaltyAccountJpaEntity la ON la.customerId = c.id
        WHERE (:includeArchived = true OR c.active = true)
        AND (:searchTerm IS NULL OR :searchTerm = '' OR
             LOWER(c.phone) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR
             LOWER(c.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR
             LOWER(c.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')))
        AND (:tier IS NULL OR la.tier = :tier)
    """)
    org.springframework.data.domain.Page<CustomerJpaEntity> findAllWithFilters(
            @Param("searchTerm") String searchTerm,
            @Param("tier") ru.florify.customer.domain.enums.LoyaltyTier tier,
            @Param("includeArchived") boolean includeArchived,
            org.springframework.data.domain.Pageable pageable
    );

    Optional<CustomerJpaEntity> findByUserId(UUID userId);

    @Query(value = """
        SELECT * FROM customers
        WHERE active = true
        AND EXTRACT(MONTH FROM birth_date) = :month
        AND EXTRACT(DAY FROM birth_date) = :day
        """, nativeQuery = true)
    List<CustomerJpaEntity> findByBirthMonthAndDay(
        @Param("month") int month,
        @Param("day") int day
    );
}
