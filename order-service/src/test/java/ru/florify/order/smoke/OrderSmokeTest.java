package ru.florify.order.smoke;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import ru.florify.common.config.GlobalSecurityConfig;
import ru.florify.common.test.SecurityMockConfig;
import ru.florify.order.adapter.in.web.OrderController;
import ru.florify.order.adapter.in.web.mapper.OrderWebMapper;
import ru.florify.order.application.port.in.CreateOrderUseCase;
import ru.florify.order.application.port.in.GetOrderByIdUseCase;
import ru.florify.order.application.port.in.GetOrdersByCustomerUseCase;
import ru.florify.order.application.port.in.GetOrdersKanbanUseCase;
import ru.florify.order.application.port.in.UpdateOrderStatusUseCase;

import java.util.UUID;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static ru.florify.common.test.SecurityTestSupport.customer;

@SpringBootTest(classes = {
        OrderSmokeTest.TestBootConfig.class,
        OrderController.class,
        GlobalSecurityConfig.class,
        SecurityMockConfig.class
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class OrderSmokeTest {

    @SpringBootConfiguration
    @EnableAutoConfiguration
    @Import({OrderController.class, GlobalSecurityConfig.class, SecurityMockConfig.class})
    static class TestBootConfig {
    }

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CreateOrderUseCase createOrderUseCase;
    @MockitoBean
    private GetOrderByIdUseCase getOrderByIdUseCase;
    @MockitoBean
    private GetOrdersKanbanUseCase getOrdersKanbanUseCase;
    @MockitoBean
    private UpdateOrderStatusUseCase updateStatusUseCase;
    @MockitoBean
    private GetOrdersByCustomerUseCase getOrdersByCustomerUseCase;
    @MockitoBean
    private OrderWebMapper orderWebMapper;

    @BeforeEach
    void setUp() {
        when(getOrdersByCustomerUseCase.execute(any(UUID.class))).thenReturn(List.of());
    }


    @Test
    void shouldReturn401WhenUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "customer", roles = "CUSTOMER")
    void shouldReturnForbiddenForCustomerOnStaffEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/orders")
                        .param("customerId", UUID.randomUUID().toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void shouldReturn200ForAdminOnOrdersList() throws Exception {
        // Staff endpoint /api/v1/orders?customerId=...
        mockMvc.perform(get("/api/v1/orders")
                        .param("customerId", UUID.randomUUID().toString()))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturn200ForCustomerOnMyOrders() throws Exception {
        mockMvc.perform(get("/api/v1/orders/my").with(customer()))
                .andExpect(status().isOk());
    }
}
