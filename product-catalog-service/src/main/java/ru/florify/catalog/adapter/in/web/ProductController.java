package ru.florify.catalog.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.florify.catalog.adapter.in.web.dto.*;
import ru.florify.catalog.adapter.in.web.mapper.ProductWebMapper;
import ru.florify.catalog.application.command.*;
import ru.florify.catalog.application.port.in.*;
import ru.florify.catalog.application.port.out.PriceHistoryRepository;
import ru.florify.catalog.application.query.GetCatalogQuery;
import ru.florify.catalog.domain.model.Product;
import ru.florify.common.application.query.PagedResult;
import ru.florify.common.security.UserProvider;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/catalog/products")
@RequiredArgsConstructor
public class ProductController {

    private final CreateProductUseCase createProductUseCase;
    private final UpdateProductUseCase updateProductUseCase;
    private final UpdatePriceUseCase updatePriceUseCase;
    private final BulkPriceUpdateUseCase bulkPriceUpdateUseCase;
    private final DeactivateProductUseCase deactivateProductUseCase;
    private final GetProductByIdUseCase getProductByIdUseCase;
    private final GetCatalogUseCase getCatalogUseCase;
    private final PriceHistoryRepository priceHistoryRepository;

    private final ProductWebMapper mapper;
    private final UserProvider userProvider;

    @GetMapping
    public PagedResult<ProductResponse> getCatalog(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false, defaultValue = "true") Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return mapper.toPagedResponse(getCatalogUseCase.execute(
                new GetCatalogQuery(categoryId, searchTerm, active, page, size)
        ));
    }

    @GetMapping("/{id}")
    public ProductResponse getProduct(@PathVariable UUID id) {
        return mapper.toResponse(getProductByIdUseCase.execute(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ProductResponse createProduct(@Valid @RequestBody CreateProductRequest request) {
        return mapper.toResponse(createProductUseCase.execute(new CreateProductCommand(
                request.name(), request.description(), request.categoryId(),
                request.unit(), request.initialPrice(), request.imageUrl(),
                request.defaultShelfLifeDays(), userProvider.getCurrentUserId()
        )));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ProductResponse updateProduct(@PathVariable UUID id, @Valid @RequestBody UpdateProductRequest request) {
        return mapper.toResponse(updateProductUseCase.execute(new UpdateProductCommand(
                id, request.name(), request.description(), request.categoryId(),
                request.imageUrl(), request.defaultShelfLifeDays(), userProvider.getCurrentUserId()
        )));
    }

    @PatchMapping("/{id}/price")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ProductResponse updatePrice(@PathVariable UUID id, @Valid @RequestBody UpdatePriceRequest request) {
        return mapper.toResponse(updatePriceUseCase.execute(new UpdatePriceCommand(
                id, request.newPrice(), request.reason(), userProvider.getCurrentUserId()
        )));
    }

    @PostMapping("/bulk-price-update")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public void bulkPriceUpdate(@Valid @RequestBody BulkPriceUpdateRequest request) {
        bulkPriceUpdateUseCase.execute(new BulkPriceUpdateCommand(
                request.categoryId(), request.markupPercent(), userProvider.getCurrentUserId()
        ));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public void deactivateProduct(@PathVariable UUID id) {
        deactivateProductUseCase.execute(new DeactivateProductCommand(id, userProvider.getCurrentUserId()));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public List<PriceHistoryResponse> getPriceHistory(@PathVariable UUID id) {
        return priceHistoryRepository.findByProductId(id).stream()
                .map(h -> new PriceHistoryResponse(
                        h.id(), h.oldPrice(), h.newPrice(),
                        h.performerId(), h.reason(), h.occurredAt()
                ))
                .collect(Collectors.toList());
    }
}
