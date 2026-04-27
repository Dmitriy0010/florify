package ru.florify.order.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.florify.common.exception.ForbiddenException;
import ru.florify.common.security.UserPrincipal;
import ru.florify.order.adapter.in.web.dto.*;
import ru.florify.order.adapter.in.web.mapper.OrderWebMapper;
import ru.florify.order.application.command.CreateOrderCommand;
import ru.florify.order.application.port.in.CreateOrderUseCase;
import ru.florify.order.application.port.in.GetOrderByIdUseCase;
import ru.florify.order.application.port.in.GetOrdersKanbanUseCase;
import ru.florify.order.application.port.in.UpdateOrderStatusUseCase;
import ru.florify.order.application.port.in.GetOrdersByCustomerUseCase;
import ru.florify.order.domain.model.Order;
import ru.florify.order.domain.model.OrderStatus;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order lifecycle management")
public class OrderController {

    private final CreateOrderUseCase createOrderUseCase;
    private final GetOrderByIdUseCase getOrderByIdUseCase;
    private final GetOrdersKanbanUseCase getOrdersKanbanUseCase;
    private final UpdateOrderStatusUseCase updateOrderStatusUseCase;
    private final GetOrdersByCustomerUseCase getOrdersByCustomerUseCase;
    private final OrderWebMapper mapper;

    @PostMapping
    @Operation(summary = "Create a new order", description = "Placing a new order. Open to guests and registered users.")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CASHIER', 'ADMIN', 'OWNER') or isAnonymous()")
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String effectiveIdempotencyKey = (idempotencyKey != null && !idempotencyKey.isBlank()) 
                ? idempotencyKey 
                : UUID.randomUUID().toString();
        
        UUID callerId = (principal != null) ? principal.getUserId() : null;
        
        // If staff provides customerId in request, use it. 
        // Otherwise, use the callerId (which is the customer themselves for online orders).
        UUID finalCustomerId = (request.customerId() != null && principal != null && !principal.getRoles().contains("ROLE_CUSTOMER"))
                ? request.customerId()
                : callerId;

        CreateOrderCommand command = mapper.toCommand(request, finalCustomerId, effectiveIdempotencyKey);
        Order order = createOrderUseCase.execute(command);
        OrderResponse response = mapper.toResponse(order);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get matching orders", description = "Fetches a list of orders. Staff only. Can filter by customerId or floristId (performer).")
    @PreAuthorize("hasAnyRole('CASHIER', 'ADMIN', 'OWNER', 'FLORIST')")
    public ResponseEntity<List<OrderResponse>> getOrders(
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) UUID floristId
    ) {
        List<Order> orders;
        if (customerId != null) {
            orders = getOrdersByCustomerUseCase.execute(customerId);
        } else if (floristId != null) {
            // New filter for employee activity
            orders = getOrdersByCustomerUseCase.executeByFlorist(floristId);
        } else {
            return ResponseEntity.ok(List.of());
        }
        
        return ResponseEntity.ok(orders.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList()));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my orders", description = "Fetches current customer's order history.")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal UserPrincipal principal) {
        List<Order> orders = getOrdersByCustomerUseCase.execute(principal.getUserId());
        return ResponseEntity.ok(orders.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details", description = "Fetches an order by its unique ID. Accessible by owner and staff.")
    @PreAuthorize("permitAll()")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Order order = getOrderByIdUseCase.execute(id);

        // IDOR protection: customers only see their own orders.
        // Guests can see any order they have the UUID for.
        if (principal != null && principal.getRoles().contains("ROLE_CUSTOMER")) {
            if (order.getCustomerId() == null || !order.getCustomerId().equals(principal.getUserId())) {
                throw new ForbiddenException("Access denied: you can only view your own orders");
            }
        }
        
        return ResponseEntity.ok(mapper.toResponse(order));
    }

    @GetMapping("/kanban")
    @Operation(summary = "Get Kanban view", description = "Fetches a list of orders for Kanban board filtered by status. Accessible by staff.")
    @PreAuthorize("hasAnyRole('CASHIER', 'FLORIST', 'ADMIN', 'OWNER')")
    public ResponseEntity<List<OrderKanbanResponse>> getKanban(
            @RequestParam OrderStatus status,
            @RequestParam(defaultValue = "50") int limit
    ) {
        List<OrderKanbanResponse> response = getOrdersKanbanUseCase.execute(status, limit)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Changes the status of an order. Accessible by staff (cashier, florist, admin).")
    @PreAuthorize("hasAnyRole('CASHIER', 'FLORIST', 'ADMIN', 'OWNER')")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        Order order = updateOrderStatusUseCase.execute(mapper.toCommand(request, id));
        return ResponseEntity.ok(mapper.toResponse(order));
    }
}
