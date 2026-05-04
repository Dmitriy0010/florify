package ru.florify.store.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.florify.store.application.port.in.CreateStoreUseCase;
import ru.florify.store.application.port.in.UpdateStoreUseCase;
import ru.florify.store.application.port.out.StoreRepositoryPort;
import ru.florify.store.domain.model.Store;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
@Tag(name = "Store Management", description = "Управление точками продаж")
public class StoreController {
    private final CreateStoreUseCase createStoreUseCase;
    private final UpdateStoreUseCase updateStoreUseCase;
    private final StoreRepositoryPort storeRepository; // Port for simple queries as it's a monolith
    private final StoreWebMapper mapper;
    private final JdbcTemplate jdbcTemplate;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Создать новую точку продаж")
    public StoreResponse createStore(@RequestBody StoreRequest request) {
        Store store = createStoreUseCase.createStore(mapper.toCommand(request));
        return mapper.toResponse(store);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Обновить информацию о точке продаж")
    public StoreResponse updateStore(@PathVariable UUID id, @RequestBody StoreRequest request) {
        Store store = updateStoreUseCase.updateStore(new ru.florify.store.application.port.in.UpdateStoreCommand(
            id,
            request.name(),
            request.address(),
            request.phone(),
            request.active()
        ));
        return mapper.toResponse(store);
    }

    @GetMapping
    @Operation(summary = "Получить список точек продаж")
    public List<StoreResponse> getAllStores(@RequestParam(required = false, defaultValue = "false") boolean includeInactive) {
        return storeRepository.findAll().stream()
                .filter(s -> includeInactive || s.isActive())
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить информацию о конкретной точке")
    public StoreResponse getStore(@PathVariable UUID id) {
        return storeRepository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Store not found"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Удалить точку продаж", description = "Удаляет точку физически или деактивирует её, если есть история операций")
    public void deleteStore(@PathVariable UUID id) {
        log.info("Request to delete/deactivate store {}", id);
        
        // В монолите можем напрямую проверить другие таблицы через JDBC, чтобы не ломать транзакцию Hibernate
        boolean hasOrders = false;
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM orders WHERE store_id = ?", Integer.class, id);
            hasOrders = count != null && count > 0;
        } catch (Exception e) {
            log.warn("Could not check orders for store {}: {}", id, e.getMessage());
        }

        if (hasOrders) {
            log.info("Store {} has orders. Deactivating instead of physical delete.", id);
            deactivateStore(id);
            return;
        }

        try {
            storeRepository.delete(id);
            log.info("Store {} physically deleted", id);
        } catch (Exception e) {
            log.warn("Failed to physically delete store {} due to internal constraints. Falling back to deactivation.", id);
            deactivateStore(id);
        }
    }

    private void deactivateStore(UUID id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        
        updateStoreUseCase.updateStore(new ru.florify.store.application.port.in.UpdateStoreCommand(
            id, store.getName(), store.getAddress(), store.getPhone(), false
        ));
    }
}
