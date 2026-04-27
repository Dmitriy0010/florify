package ru.florify.notification.adapter.in.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;
import ru.florify.notification.adapter.in.web.mapper.NotificationWebMapper;
import ru.florify.notification.application.port.in.NotificationTemplateUseCase;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = NotificationTemplateController.class)
@Import(NotificationTemplateControllerTest.TestSecurityConfig.class)
class NotificationTemplateControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private NotificationTemplateUseCase templateUseCase;

    @MockBean
    private NotificationWebMapper mapper;

    @Test
    void list_whenUnauthenticated_shouldReturn401() throws Exception {
        mvc.perform(get("/api/v1/notifications/templates"))
                .andExpect(status().isUnauthorized());
    }

    @TestConfiguration
    @EnableWebSecurity
    @EnableMethodSecurity
    static class TestSecurityConfig {
        @Bean
        SecurityFilterChain testFilterChain(HttpSecurity http) throws Exception {
            http
                    .csrf(csrf -> csrf.disable())
                    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                    .httpBasic(basic -> {});
            return http.build();
        }
    }
}

