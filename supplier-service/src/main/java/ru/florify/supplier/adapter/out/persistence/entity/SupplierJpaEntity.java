package ru.florify.supplier.adapter.out.persistence.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import ru.florify.supplier.domain.model.PaymentTerms;

import java.time.Instant;
import java.util.UUID;

@Entity(name = "SupplierEntity")
@Table(name = "suppliers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SupplierJpaEntity {
    @Id
    @EqualsAndHashCode.Include
    private UUID id;
    @jakarta.persistence.Column(length = 255)
    private String name;
    @jakarta.persistence.Column(length = 255)
    private String contactPerson;
    @jakarta.persistence.Column(length = 50)
    private String phone;
    @jakarta.persistence.Column(length = 255)
    private String email;
    @jakarta.persistence.Column(columnDefinition = "text")
    private String address;
    @jakarta.persistence.Column(length = 50)
    private String taxId;
    @Enumerated(EnumType.STRING)
    private PaymentTerms paymentTerms;
    @Min(1)
    @Max(5)
    private Integer rating;
    private String notes;
    private boolean active;
    private Instant createdAt;
}
