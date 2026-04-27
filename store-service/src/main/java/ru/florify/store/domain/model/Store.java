package ru.florify.store.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Store {
    @EqualsAndHashCode.Include
    private UUID id;
    
    private String name;
    private String address;
    private String phone;
    private boolean active;

    /**
     * Фабричный метод для новой точки продаж
     */
    public static Store create(String name, String address, String phone, boolean active) {
        return Store.builder()
                .id(UUID.randomUUID())
                .name(name)
                .address(address)
                .phone(phone)
                .active(active)
                .build();
    }
}
