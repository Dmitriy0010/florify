package ru.florify.supplier.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Supplier {

    @EqualsAndHashCode.Include
    private UUID id;

    private String name;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String taxId;
    private PaymentTerms paymentTerms;
    private Integer rating;
    private String notes;
    private boolean active;
    private Instant createdAt;
}
