package ru.florify.customer.smoke;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import ru.florify.common.config.GlobalSecurityConfig;
import ru.florify.common.test.SecurityMockConfig;
import ru.florify.customer.adapter.in.web.CustomerController;
import ru.florify.customer.adapter.in.web.mapper.CustomerWebMapper;
import ru.florify.customer.application.port.in.DeactivateCustomerUseCase;
import ru.florify.customer.application.port.in.GetCustomerByIdUseCase;
import ru.florify.customer.application.port.in.GetCustomerListUseCase;
import ru.florify.customer.application.port.in.UpdateCustomerUseCase;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static ru.florify.common.test.SecurityTestSupport.admin;

@WebMvcTest(controllers = CustomerController.class)
@Import({GlobalSecurityConfig.class, SecurityMockConfig.class})
@ActiveProfiles("test")
public class CustomerSmokeTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GetCustomerListUseCase getCustomerListUseCase;
    @MockitoBean
    private GetCustomerByIdUseCase getCustomerByIdUseCase;
    @MockitoBean
    private UpdateCustomerUseCase updateCustomerUseCase;
    @MockitoBean
    private DeactivateCustomerUseCase deactivateCustomerUseCase;
    @MockitoBean
    private CustomerWebMapper customerWebMapper;

    @Test
    void shouldReturn401WhenUnauthorized() throws Exception {
        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturn200ForAdminOnCustomerList() throws Exception {
        mockMvc.perform(get("/api/customers").with(admin()))
                .andExpect(status().isOk());
    }
}
