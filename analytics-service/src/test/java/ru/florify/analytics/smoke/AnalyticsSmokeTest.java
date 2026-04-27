package ru.florify.analytics.smoke;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import ru.florify.analytics.adapter.in.web.AnalyticsDashboardController;
import ru.florify.analytics.application.port.in.GetDashboardUseCase;
import ru.florify.common.config.GlobalSecurityConfig;
import ru.florify.common.test.SecurityMockConfig;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static ru.florify.common.test.SecurityTestSupport.admin;

@SpringBootTest(classes = {
        AnalyticsSmokeTest.TestBootConfig.class,
        AnalyticsDashboardController.class,
        GlobalSecurityConfig.class,
        SecurityMockConfig.class
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AnalyticsSmokeTest {

    @SpringBootConfiguration
    @EnableAutoConfiguration
    @Import({AnalyticsDashboardController.class, GlobalSecurityConfig.class, SecurityMockConfig.class})
    static class TestBootConfig {
    }

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GetDashboardUseCase getDashboardUseCase;

    @Test
    void shouldReturn401WhenUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturn200ForAdminOnDashboard() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/dashboard").with(admin()))
                .andExpect(status().isOk());
    }
}
