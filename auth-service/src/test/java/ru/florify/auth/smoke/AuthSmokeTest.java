package ru.florify.auth.smoke;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import ru.florify.auth.adapter.in.web.AuthController;
import ru.florify.auth.adapter.in.web.mapper.AuthMapper;
import ru.florify.auth.adapter.in.web.mapper.UserWebMapper;
import ru.florify.auth.application.port.in.AssignRoleUseCase;
import ru.florify.auth.application.port.in.ChangePasswordUseCase;
import ru.florify.auth.application.port.in.GetCurrentUserUseCase;
import ru.florify.auth.application.port.in.LoginUserUseCase;
import ru.florify.auth.application.port.in.LogoutUseCase;
import ru.florify.auth.application.port.in.RefreshTokenUseCase;
import ru.florify.auth.application.port.in.RegisterUserUseCase;
import ru.florify.common.config.GlobalSecurityConfig;
import ru.florify.common.test.SecurityMockConfig;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static ru.florify.common.test.SecurityTestSupport.customer;

@WebMvcTest(controllers = AuthController.class)
@Import({GlobalSecurityConfig.class, SecurityMockConfig.class})
@ActiveProfiles("test")
public class AuthSmokeTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RegisterUserUseCase registerUserUseCase;
    @MockitoBean
    private LoginUserUseCase loginUserUseCase;
    @MockitoBean
    private RefreshTokenUseCase refreshTokenUseCase;
    @MockitoBean
    private LogoutUseCase logoutUseCase;
    @MockitoBean
    private GetCurrentUserUseCase getCurrentUserUseCase;
    @MockitoBean
    private AssignRoleUseCase assignRoleUseCase;
    @MockitoBean
    private ChangePasswordUseCase changePasswordUseCase;
    @MockitoBean
    private AuthMapper authMapper;
    @MockitoBean
    private UserWebMapper userWebMapper;

    @Test
    void shouldReturn401OnMeWhenUnauthorized() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturn200OnMeWhenAuthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me").with(customer()))
                .andExpect(status().isOk());
    }
}
