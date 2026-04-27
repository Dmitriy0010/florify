package ru.florify.customer.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import ru.florify.customer.domain.enums.CustomerSource;
import ru.florify.customer.domain.enums.Gender;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "customers")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CustomerJpaEntity {

    @Id
    @EqualsAndHashCode.Include
    private UUID id;

    private String phone;
    private String email;
    private String firstName;
    private String lastName;
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender = Gender.UNSPECIFIED;

    @Enumerated(EnumType.STRING)
    private CustomerSource source;

    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> tags;

    private UUID userId;
    private boolean active;

    private Instant createdAt;
    private Instant updatedAt;
}
