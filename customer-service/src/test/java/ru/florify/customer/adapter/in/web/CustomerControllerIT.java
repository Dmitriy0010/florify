package ru.florify.customer.adapter.in.web;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import ru.florify.common.security.JwtProperties;
import ru.florify.customer.BaseIntegrationTest;
import ru.florify.customer.adapter.in.web.dto.CustomerResponse;
import ru.florify.customer.adapter.out.persistence.entity.CustomerJpaEntity;
import ru.florify.customer.adapter.out.persistence.repository.CustomerJpaRepository;
import ru.florify.customer.domain.enums.CustomerSource;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class CustomerControllerIT extends BaseIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private CustomerJpaRepository customerJpaRepository;

    @Autowired
    private JwtProperties jwtProperties;

    private UUID customerId;
    private UUID ownerUserId;

    @BeforeEach
    void setUp() {
        customerJpaRepository.deleteAll();

        ownerUserId = UUID.randomUUID();
        customerId = UUID.randomUUID();

        customerJpaRepository.save(CustomerJpaEntity.builder()
                .id(customerId)
                .phone("+79001112233")
                .firstName("John")
                .lastName("Doe")
                .source(CustomerSource.WEB)
                .active(true)
                .userId(ownerUserId)
                .createdAt(Instant.now())
                .build());
    }

    @Test
    @DisplayName("GET /api/customers/{id} - Owner should access their own profile")
    void ownerCanAccessOwnProfile() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(createToken(ownerUserId, List.of("ROLE_CUSTOMER")));

        ResponseEntity<CustomerResponse> response = restTemplate.exchange(
                "/api/customers/" + customerId,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                CustomerResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().firstName()).isEqualTo("John");
    }

    @Test
    @DisplayName("GET /api/customers/{id} - Another CLIENT should be denied (IDOR)")
    void otherClientCannotAccessProfile() {
        UUID otherUserId = UUID.randomUUID();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(createToken(otherUserId, List.of("ROLE_CUSTOMER")));

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/customers/" + customerId,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("GET /api/customers/{id} - ADMIN can access any profile")
    void adminCanAccessAnyProfile() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(createToken(UUID.randomUUID(), List.of("ROLE_ADMIN")));

        ResponseEntity<CustomerResponse> response = restTemplate.exchange(
                "/api/customers/" + customerId,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                CustomerResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("GET /api/customers/{id} - No token → 401")
    void noTokenReturnsUnauthorized() {
        ResponseEntity<String> response = restTemplate.exchange(
                "/api/customers/" + customerId,
                HttpMethod.GET,
                HttpEntity.EMPTY,
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    private String createToken(UUID userId, List<String> roles) {
        var key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(userId.toString())
                .claim("roles", roles)
                .issuer("florify-auth")
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plus(1, ChronoUnit.HOURS)))
                .signWith(key)
                .compact();
    }
}
