package ru.florify.catalog.smoke;

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
import ru.florify.catalog.adapter.in.web.CategoryController;
import ru.florify.catalog.adapter.in.web.ProductController;
import ru.florify.catalog.adapter.in.web.mapper.ProductWebMapper;
import ru.florify.catalog.application.port.in.BulkPriceUpdateUseCase;
import ru.florify.catalog.application.port.in.CreateProductUseCase;
import ru.florify.catalog.application.port.in.DeactivateProductUseCase;
import ru.florify.catalog.application.port.in.GetCatalogUseCase;
import ru.florify.catalog.application.port.in.GetProductByIdUseCase;
import ru.florify.catalog.application.port.in.UpdatePriceUseCase;
import ru.florify.catalog.application.port.in.UpdateProductUseCase;
import ru.florify.catalog.application.port.out.CategoryRepository;
import ru.florify.common.config.GlobalSecurityConfig;
import ru.florify.common.test.SecurityMockConfig;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = {
        CatalogSmokeTest.TestBootConfig.class,
        ProductController.class,
        CategoryController.class,
        GlobalSecurityConfig.class,
        SecurityMockConfig.class
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class CatalogSmokeTest {

    @SpringBootConfiguration
    @EnableAutoConfiguration
    @Import({ProductController.class, CategoryController.class, GlobalSecurityConfig.class, SecurityMockConfig.class})
    static class TestBootConfig {
    }

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CreateProductUseCase createProductUseCase;
    @MockitoBean
    private UpdateProductUseCase updateProductUseCase;
    @MockitoBean
    private UpdatePriceUseCase updatePriceUseCase;
    @MockitoBean
    private BulkPriceUpdateUseCase bulkPriceUpdateUseCase;
    @MockitoBean
    private DeactivateProductUseCase deactivateProductUseCase;
    @MockitoBean
    private GetProductByIdUseCase getProductByIdUseCase;
    @MockitoBean
    private GetCatalogUseCase getCatalogUseCase;
    @MockitoBean
    private ProductWebMapper productWebMapper;
    @MockitoBean
    private CategoryRepository categoryRepository;

    @Test
    void shouldReturn200ForAuthenticatedProductList() throws Exception {
        mockMvc.perform(get("/api/v1/catalog/products").with(ru.florify.common.test.SecurityTestSupport.admin()))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturn200ForAuthenticatedCategoryList() throws Exception {
        mockMvc.perform(get("/api/v1/catalog/categories").with(ru.florify.common.test.SecurityTestSupport.admin()))
                .andExpect(status().isOk());
    }
}
