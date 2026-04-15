package ru.florify.customer.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.florify.customer.adapter.in.web.dto.*;
import ru.florify.customer.adapter.in.web.mapper.CustomerWebMapper;
import ru.florify.customer.application.command.UpdateCustomerCommand;
import ru.florify.customer.application.port.in.DeactivateCustomerUseCase;
import ru.florify.customer.application.port.in.GetCustomerByIdUseCase;
import ru.florify.customer.application.port.in.GetCustomerListUseCase;
import ru.florify.customer.application.port.in.UpdateCustomerUseCase;
import ru.florify.customer.application.query.GetCustomerListQuery;
import ru.florify.common.application.query.PagedResult;
import ru.florify.customer.domain.model.Customer;

import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final GetCustomerListUseCase getCustomerListUseCase;
    private final GetCustomerByIdUseCase getCustomerByIdUseCase;
    private final UpdateCustomerUseCase updateCustomerUseCase;
    private final DeactivateCustomerUseCase deactivateCustomerUseCase;
    private final CustomerWebMapper mapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'FLORIST')")
    public PagedResponse<CustomerSummaryResponse> listCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String phone) {
        
        GetCustomerListQuery query = new GetCustomerListQuery(phone, null, null, page, size);
        PagedResult<Customer> result = getCustomerListUseCase.execute(query);
        return mapper.toPagedResponse(result);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'FLORIST') or @securityService.isOwner(#id)")
    public CustomerResponse getCustomer(@PathVariable UUID id) {
        Customer customer = getCustomerByIdUseCase.execute(id);
        return mapper.toResponse(customer);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'FLORIST') or @securityService.isOwner(#id)")
    public CustomerResponse updateCustomer(@PathVariable UUID id, @Valid @RequestBody UpdateCustomerRequest request) {
        // Load current to get email and notification preferences if not in request
        Customer current = getCustomerByIdUseCase.execute(id);
        
        UpdateCustomerCommand command = new UpdateCustomerCommand(
                id,
                request.email() != null ? request.email() : current.getEmail(),
                request.firstName(),
                request.lastName(),
                request.birthDate(),
                request.gender(),
                request.tags(),
                current.getNotificationPreferences()
        );
        
        Customer updated = updateCustomerUseCase.execute(command);
        return mapper.toResponse(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER', 'FLORIST')")
    public ResponseEntity<Void> deactivateCustomer(@PathVariable UUID id) {
        deactivateCustomerUseCase.execute(id);
        return ResponseEntity.noContent().build();
    }
}
