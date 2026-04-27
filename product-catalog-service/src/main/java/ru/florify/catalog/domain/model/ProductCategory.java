package ru.florify.catalog.domain.model;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ProductCategory {

    @EqualsAndHashCode.Include
    private UUID id;

    private String name;
    private String description;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
