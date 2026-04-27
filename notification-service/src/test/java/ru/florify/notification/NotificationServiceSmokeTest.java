package ru.florify.notification;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class NotificationServiceSmokeTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
            .withDatabaseName("florify")
            .withUsername("florify_user")
            .withPassword("florify_pass");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", postgres::getJdbcUrl);
        r.add("spring.datasource.username", postgres::getUsername);
        r.add("spring.datasource.password", postgres::getPassword);
        r.add("spring.flyway.enabled", () -> "true");
        r.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        r.add("spring.kafka.listener.auto-startup", () -> "false");
        r.add("notification.stub.email", () -> "smoke@example.com");
        r.add("notification.stub.telegramChatId", () -> "123456");
    }

    @Autowired
    private MockMvc mvc;

    @BeforeEach
    void setAuth() {
        var auth = new UsernamePasswordAuthenticationToken(
                "admin",
                "N/A",
                java.util.List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void clearAuth() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void templateCrud_smoke() throws Exception {
        String body = """
                {
                  "code": "ORDER_CREATED",
                  "channel": "EMAIL",
                  "subject": "Order {{orderId}} created",
                  "bodyTemplate": "Hello {{name}}",
                  "isActive": true
                }
                """;

        mvc.perform(post("/api/v1/notifications/templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.code").value("ORDER_CREATED"))
                .andExpect(jsonPath("$.channel").value("EMAIL"));

        mvc.perform(get("/api/v1/notifications/templates"))
                .andExpect(status().isOk());
    }
}

