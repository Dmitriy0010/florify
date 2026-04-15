package ru.florify.customer.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.florify.common.security.UserPrincipal;
import ru.florify.customer.adapter.in.web.dto.AddCustomerEventRequest;
import ru.florify.customer.adapter.in.web.dto.CustomerEventResponse;
import ru.florify.customer.adapter.in.web.mapper.CustomerWebMapper;
import ru.florify.customer.application.command.AddCustomerEventCommand;
import ru.florify.customer.application.port.in.AddCustomerEventUseCase;
import ru.florify.customer.application.port.out.CustomerEventRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customers/{customerId}/events")
@RequiredArgsConstructor
public class CustomerEventController {

    private final AddCustomerEventUseCase addCustomerEventUseCase;
    private final CustomerEventRepository eventRepository;
    private final CustomerWebMapper mapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE') or @securityService.isOwner(#customerId)")
    public List<CustomerEventResponse> getEvents(@PathVariable UUID customerId) {
        return eventRepository.findByCustomerId(customerId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE') or @securityService.isOwner(#customerId)")
    public void addEvent(
            @PathVariable UUID customerId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddCustomerEventRequest request) {
        
        AddCustomerEventCommand command = new AddCustomerEventCommand(
                customerId,
                principal.getUserId(),
                request.type(),
                request.content()
        );
        
        addCustomerEventUseCase.execute(command);
    }
}
