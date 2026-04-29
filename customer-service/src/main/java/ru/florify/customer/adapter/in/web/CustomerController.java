package ru.florify.customer.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.florify.customer.adapter.in.web.dto.*;
import ru.florify.customer.adapter.in.web.mapper.CustomerWebMapper;
import ru.florify.customer.application.command.UpdateCustomerCommand;
import ru.florify.customer.application.port.in.CreateCustomerUseCase;
import ru.florify.customer.application.port.in.DeactivateCustomerUseCase;
import ru.florify.customer.application.port.in.GetCustomerByIdUseCase;
import ru.florify.customer.application.port.in.GetCustomerListUseCase;
import ru.florify.customer.application.port.in.UpdateCustomerUseCase;
import ru.florify.customer.application.query.GetCustomerListQuery;
import ru.florify.common.application.query.PagedResult;
import ru.florify.customer.domain.enums.CustomerSource;
import ru.florify.customer.domain.model.Customer;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CreateCustomerUseCase createCustomerUseCase;
    private final GetCustomerListUseCase getCustomerListUseCase;
    private final GetCustomerByIdUseCase getCustomerByIdUseCase;
    private final UpdateCustomerUseCase updateCustomerUseCase;
    private final DeactivateCustomerUseCase deactivateCustomerUseCase;
    private final CustomerWebMapper mapper;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'FLORIST', 'OWNER')")
    public CustomerResponse createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        Customer customer = createCustomerUseCase.execute(mapper.toCommand(request, CustomerSource.POS));
        return mapper.toResponse(customer);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'FLORIST', 'OWNER')")
    public PagedResponse<CustomerSummaryResponse> listCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) ru.florify.customer.domain.enums.LoyaltyTier tier,
            @RequestParam(defaultValue = "false") boolean includeArchived) {
        
        GetCustomerListQuery query = new GetCustomerListQuery(phone, null, tier, page, size);
        // Note: includeArchived should be handled in the interactor
        PagedResult<Customer> result = getCustomerListUseCase.execute(query, includeArchived);
        return mapper.toPagedResponse(result);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'FLORIST', 'OWNER') or @securityService.isOwner(#id)")
    public CustomerResponse getCustomer(@PathVariable UUID id) {
        Customer customer = getCustomerByIdUseCase.execute(id);
        return mapper.toResponse(customer);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'FLORIST', 'OWNER') or @securityService.isOwner(#id)")
    public CustomerResponse updateCustomer(@PathVariable UUID id, @Valid @RequestBody UpdateCustomerRequest request) {
        Customer current = getCustomerByIdUseCase.execute(id);

        UpdateCustomerCommand command = new UpdateCustomerCommand(
                id,
                request.email() != null ? request.email() : current.getEmail(),
                request.firstName(),
                request.lastName() != null ? request.lastName() : current.getLastName(),
                request.birthDate() != null ? request.birthDate() : current.getBirthDate(),
                request.gender() != null ? request.gender() : current.getGender(),
                request.tags() != null ? request.tags() : current.getTags()
        );
        
        Customer updated = updateCustomerUseCase.execute(command);
        return mapper.toResponse(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'FLORIST', 'OWNER')")
    public ResponseEntity<Void> deactivateCustomer(@PathVariable UUID id) {
        deactivateCustomerUseCase.execute(id);
        return ResponseEntity.noContent().build();
    }
}
