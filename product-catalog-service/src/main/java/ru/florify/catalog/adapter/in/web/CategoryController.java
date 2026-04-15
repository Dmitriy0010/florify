package ru.florify.catalog.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.florify.catalog.adapter.in.web.dto.CategoryResponse;
import ru.florify.catalog.application.port.out.CategoryRepository;
import ru.florify.catalog.domain.model.ProductCategory;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/catalog/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAllActive().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getDescription(), c.isActive()))
                .collect(Collectors.toList());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public CategoryResponse createCategory(@Valid @RequestBody CategoryResponse request) {
        ProductCategory category = ProductCategory.builder()
                .id(UUID.randomUUID())
                .name(request.name())
                .description(request.description())
                .active(true)
                .build();
        ProductCategory saved = categoryRepository.save(category);
        return new CategoryResponse(saved.getId(), saved.getName(), saved.getDescription(), saved.isActive());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public CategoryResponse updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryResponse request) {
        ProductCategory category = categoryRepository.findCategoryById(id)
                .orElseThrow(() -> new RuntimeException("Category not found: " + id));
        
        category.setName(request.name());
        category.setDescription(request.description());
        category.setActive(request.active());
        
        ProductCategory saved = categoryRepository.save(category);
        return new CategoryResponse(saved.getId(), saved.getName(), saved.getDescription(), saved.isActive());
    }
}
