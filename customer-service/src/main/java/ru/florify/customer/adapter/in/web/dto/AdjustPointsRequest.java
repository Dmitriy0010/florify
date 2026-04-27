package ru.florify.customer.adapter.in.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.extern.jackson.Jacksonized;

@Builder
@Jacksonized
public record AdjustPointsRequest(
    @Min(1)
    int points,
    
    @NotBlank
    String type, // EARN or WITHDRAW
    
    String description
) {}
