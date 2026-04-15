package ru.florify.customer.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import ru.florify.customer.domain.enums.EventType;

public record AddCustomerEventRequest(
    EventType type,
    @NotBlank String content
) {}
