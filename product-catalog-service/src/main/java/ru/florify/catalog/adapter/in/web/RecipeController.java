package ru.florify.catalog.adapter.in.web;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.florify.catalog.application.service.RecipeInteractor;
import ru.florify.catalog.domain.model.Recipe;
import ru.florify.catalog.domain.model.RecipeItem;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/catalog/recipes")
@RequiredArgsConstructor
@Tag(name = "Recipes", description = "Технологические карты (BOM)")
public class RecipeController {

    private final RecipeInteractor recipeInteractor;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<RecipeResponse> createRecipe(@RequestBody CreateRecipeRequest request) {
        List<RecipeItem> items = request.items().stream()
                .map(item -> RecipeItem.builder()
                        .ingredientId(item.ingredientId())
                        .quantity(item.quantity())
                        .build())
                .collect(Collectors.toList());
        
        Recipe recipe = recipeInteractor.saveRecipe(request.productId(), items);
        return ResponseEntity.ok(mapToResponse(recipe));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'CASHIER', 'FLORIST')")
    public ResponseEntity<List<RecipeResponse>> getAll() {
        return ResponseEntity.ok(recipeInteractor.getAllRecipes().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        recipeInteractor.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }

    private RecipeResponse mapToResponse(Recipe recipe) {
        return new RecipeResponse(
                recipe.getId(),
                recipe.getProductId(),
                recipe.isActive(),
                recipe.getItems().stream()
                        .map(item -> new RecipeResponse.Item(item.getIngredientId(), item.getQuantity()))
                        .collect(Collectors.toList())
        );
    }

    public record CreateRecipeRequest(UUID productId, List<ItemRequest> items) {}
    public record ItemRequest(UUID ingredientId, BigDecimal quantity) {}
    public record RecipeResponse(UUID id, UUID productId, boolean isActive, List<Item> items) {
        public record Item(UUID ingredientId, BigDecimal quantity) {}
    }
}
