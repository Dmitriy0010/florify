package ru.florify.catalog.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.catalog.application.command.CreateCategoryCommand;
import ru.florify.catalog.application.command.UpdateCategoryCommand;
import ru.florify.catalog.application.port.in.CreateCategoryUseCase;
import ru.florify.catalog.application.port.in.UpdateCategoryUseCase;
import ru.florify.catalog.application.port.out.CategoryRepository;
import ru.florify.catalog.domain.exception.CategoryNotFoundException;
import ru.florify.catalog.domain.model.ProductCategory;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ManageCategoryInteractor implements CreateCategoryUseCase, UpdateCategoryUseCase {

    private final CategoryRepository categoryRepository;
    private final Clock clock;

    @Override
    @Transactional
    public ProductCategory execute(CreateCategoryCommand command) {
        Instant now = clock.instant();
        ProductCategory category = ProductCategory.builder()
                .id(UUID.randomUUID())
                .name(command.name())
                .description(command.description())
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .build();
        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public ProductCategory execute(UpdateCategoryCommand command) {
        ProductCategory existing = categoryRepository.findCategoryById(command.categoryId())
                .orElseThrow(() -> new CategoryNotFoundException(command.categoryId()));
        
        Instant now = clock.instant();
        
        // Update fields
        existing.setName(command.name());
        existing.setDescription(command.description());
        existing.setActive(command.active());
        existing.setUpdatedAt(now);
        
        return categoryRepository.save(existing);
    }
}
