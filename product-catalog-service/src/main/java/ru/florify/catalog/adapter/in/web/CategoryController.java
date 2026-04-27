package ru.florify.catalog.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.florify.catalog.adapter.in.web.dto.CategoryResponse;
import ru.florify.catalog.application.command.CreateCategoryCommand;
import ru.florify.catalog.application.command.UpdateCategoryCommand;
import ru.florify.catalog.application.port.in.CreateCategoryUseCase;
import ru.florify.catalog.application.port.in.UpdateCategoryUseCase;
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
    private final CreateCategoryUseCase createCategoryUseCase;
    private final UpdateCategoryUseCase updateCategoryUseCase;

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
        CreateCategoryCommand command = new CreateCategoryCommand(request.name(), request.description());
        ProductCategory saved = createCategoryUseCase.execute(command);
        return new CategoryResponse(saved.getId(), saved.getName(), saved.getDescription(), saved.isActive());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public CategoryResponse updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryResponse request) {
        UpdateCategoryCommand command = new UpdateCategoryCommand(
                id, 
                request.name(), 
                request.description(), 
                request.active()
        );
        ProductCategory saved = updateCategoryUseCase.execute(command);
        return new CategoryResponse(saved.getId(), saved.getName(), saved.getDescription(), saved.isActive());
    }
}
