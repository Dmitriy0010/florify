package ru.florify.customer.adapter.out.persistence.mapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import ru.florify.customer.adapter.out.persistence.entity.CustomerJpaEntity;
import ru.florify.customer.domain.model.Customer;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = {CustomerPersistenceMapperImpl.class})
class PersistenceMappingTest {

    @Autowired
    private CustomerPersistenceMapper mapper;

    @Test
    void shouldMapCustomerToDomain() {
        // given
        UUID id = UUID.randomUUID();
        CustomerJpaEntity entity = CustomerJpaEntity.builder()
            .id(id)
            .firstName("Ivan")
            .lastName("Ivanov")
            .birthDate(LocalDate.of(1990, 1, 1))
            .tags(List.of("tag1", "tag2"))
            .active(true)
            .build();
        
        // when
        Customer domain = mapper.toDomain(entity);

        // then
        assertThat(domain.getId()).isEqualTo(id);
        assertThat(domain.getFirstName()).isEqualTo("Ivan");
        assertThat(domain.getTags()).containsExactly("tag1", "tag2");
    }
}
