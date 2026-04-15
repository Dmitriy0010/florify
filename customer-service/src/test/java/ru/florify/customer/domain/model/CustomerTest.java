package ru.florify.customer.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import ru.florify.customer.domain.enums.CustomerSource;
import ru.florify.customer.domain.enums.Gender;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class CustomerTest {

    @Test
    @DisplayName("Should link user successfully")
    void shouldLinkUser() {
        // given
        Customer customer = createBaseCustomer();
        UUID userId = UUID.randomUUID();
        Instant now = Instant.now();

        // when
        Customer result = customer.linkUser(userId, now);

        // then
        assertThat(result.getUserId()).isEqualTo(userId);
        assertThat(result.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should deactivate customer")
    void shouldDeactivate() {
        // given
        Customer customer = createBaseCustomer();
        Instant now = Instant.now();

        // when
        Customer result = customer.deactivate(now);

        // then
        assertThat(result.isActive()).isFalse();
        assertThat(result.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should update tags via replacement")
    void shouldUpdateTags() {
        // given
        Customer customer = createBaseCustomer().withTags(List.of("old", "tags"));
        List<String> newTags = List.of("vip", "flower-lover");
        Instant now = Instant.now();

        // when
        Customer result = customer.updateTags(newTags, now);

        // then
        assertThat(result.getTags()).containsExactlyElementsOf(newTags);
        assertThat(result.getUpdatedAt()).isEqualTo(now);
    }

    private Customer createBaseCustomer() {
        return Customer.builder()
            .id(UUID.randomUUID())
            .phone("+79001112233")
            .email("test@florify.ru")
            .firstName("Ivan")
            .lastName("Ivanov")
            .gender(Gender.MALE)
            .source(CustomerSource.WEB)
            .tags(List.of())
            .active(true)
            .version(0)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    }
}
