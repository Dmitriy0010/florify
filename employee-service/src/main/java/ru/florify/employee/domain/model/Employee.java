package ru.florify.employee.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Employee {
    @EqualsAndHashCode.Include
    private UUID id;
    private UUID userId;
    private UUID storeId;
    private String firstName;
    private String lastName;
    private String phone;
    private EmployeeRole role;
    private LocalDate hireDate;
    private LocalDate dismissDate;
    private boolean active;
    private String avatarUrl;

    public Employee dismiss(LocalDate date) {
        return this.toBuilder()
                .dismissDate(date)
                .active(false)
                .build();
    }
}
