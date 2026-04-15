package ru.florify.catalog.adapter.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.catalog.BaseIntegrationTest;
import ru.florify.catalog.adapter.in.web.dto.CreateProductRequest;
import ru.florify.catalog.adapter.in.web.dto.UpdatePriceRequest;
import ru.florify.catalog.adapter.out.persistence.entity.ProductCategoryJpaEntity;
import ru.florify.catalog.adapter.out.persistence.entity.ProductJpaEntity;
import ru.florify.catalog.adapter.out.persistence.repository.CategoryJpaRepository;
import ru.florify.catalog.adapter.out.persistence.repository.ProductJpaRepository;
import ru.florify.catalog.security.WithMockUserPrincipal;
import ru.florify.common.domain.enums.UnitOfMeasure;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@Transactional
class ProductControllerIT extends BaseIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private ProductJpaRepository productRepository;
    @Autowired private CategoryJpaRepository categoryRepository;

    private UUID categoryId;

    @BeforeEach
    void setUp() {
        ProductCategoryJpaEntity category = ProductCategoryJpaEntity.builder()
                .id(UUID.randomUUID())
                .name("Flowers")
                .active(true)
                .createdAt(Instant.now())
                .build();
        categoryRepository.save(category);
        categoryId = category.getId();
    }

    @Test
    void getProducts_shouldBePublic() throws Exception {
        mockMvc.perform(get("/api/v1/catalog/products"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUserPrincipal(roles = "ADMIN")
    void createProduct_shouldSucceedForAdmin() throws Exception {
        CreateProductRequest request = new CreateProductRequest(
                "Rose Red",
                "Beautiful red rose",
                categoryId,
                UnitOfMeasure.PIECE,
                BigDecimal.valueOf(150.0),
                "http://example.com/rose.jpg",
                7
        );

        mockMvc.perform(post("/api/v1/catalog/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Rose Red"))
                .andExpect(jsonPath("$.sku").value("ROSE-RED"));
    }

    @Test
    @WithMockUserPrincipal(roles = "CUSTOMER")
    void createProduct_shouldFailForCustomer() throws Exception {
        CreateProductRequest request = new CreateProductRequest("Fail", "desc", categoryId, UnitOfMeasure.PIECE, BigDecimal.ONE, null, 1);
        mockMvc.perform(post("/api/v1/catalog/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUserPrincipal(roles = "ADMIN")
    void updatePrice_shouldUpdateAndEvictCache() throws Exception {
        // 1. Create product
        ProductCategoryJpaEntity category = categoryRepository.findById(categoryId)
                .map(mapper -> ProductCategoryJpaEntity.builder()
                        .id(categoryId)
                        .name("Flowers")
                        .active(true)
                        .build()) // Re-fetch or re-create since it's transactional
                .orElseThrow();

        ProductJpaEntity product = ProductJpaEntity.builder()
                .id(UUID.randomUUID())
                .name("Tulip")
                .sku("TULIP-001")
                .category(category)
                .currentPrice(BigDecimal.valueOf(100.0))
                .unit(UnitOfMeasure.PIECE)
                .active(true)
                .createdAt(Instant.now())
                .build();
        productRepository.save(product);

        // 2. Update price
        UpdatePriceRequest request = new UpdatePriceRequest(BigDecimal.valueOf(120.0), "Inflation");

        mockMvc.perform(put("/api/v1/catalog/products/" + product.getId() + "/price")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // 3. Verify price in DB
        mockMvc.perform(get("/api/v1/catalog/products/" + product.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPrice").value(120.0));
    }
}
