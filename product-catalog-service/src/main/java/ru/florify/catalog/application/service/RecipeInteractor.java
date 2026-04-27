package ru.florify.catalog.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.catalog.adapter.out.persistence.RecipeItemJpaEntity;
import ru.florify.catalog.adapter.out.persistence.RecipeJpaEntity;
import ru.florify.catalog.adapter.out.persistence.RecipeJpaRepository;
import ru.florify.catalog.domain.model.Recipe;
import ru.florify.catalog.domain.model.RecipeItem;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipeInteractor {

    private final RecipeJpaRepository recipeRepository;

    @Transactional
    public Recipe saveRecipe(UUID productId, List<RecipeItem> items) {
        Instant now = Instant.now();
        
        RecipeJpaEntity entity = recipeRepository.findByProductId(productId)
                .orElse(RecipeJpaEntity.builder()
                        .id(UUID.randomUUID())
                        .productId(productId)
                        .createdAt(now)
                        .build());

        entity.setUpdatedAt(now);
        entity.setActive(true);
        
        // Update items
        if (entity.getItems() != null) {
            entity.getItems().clear();
        } else {
            entity.setItems(new java.util.ArrayList<>());
        }

        entity.getItems().addAll(items.stream()
                .map(item -> RecipeItemJpaEntity.builder()
                        .id(UUID.randomUUID())
                        .recipe(entity)
                        .ingredientId(item.getIngredientId())
                        .quantity(item.getQuantity())
                        .createdAt(now)
                        .build())
                .collect(Collectors.toList()));

        RecipeJpaEntity saved = recipeRepository.save(entity);
        return mapToDomain(saved);
    }

    @Transactional(readOnly = true)
    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll().stream()
                .map(this::mapToDomain)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteRecipe(UUID id) {
        recipeRepository.deleteById(id);
    }

    private Recipe mapToDomain(RecipeJpaEntity entity) {
        return Recipe.builder()
                .id(entity.getId())
                .productId(entity.getProductId())
                .isActive(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .items(entity.getItems().stream()
                        .map(item -> RecipeItem.builder()
                                .id(item.getId())
                                .ingredientId(item.getIngredientId())
                                .quantity(item.getQuantity())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
