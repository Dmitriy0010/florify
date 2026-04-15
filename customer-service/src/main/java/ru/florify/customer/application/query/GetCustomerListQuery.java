package ru.florify.customer.application.query;

import ru.florify.customer.domain.enums.LoyaltyTier;

public record GetCustomerListQuery(
    String searchTerm,   // Search by phone, email, firstName, lastName
    String tag,          // nullable
    LoyaltyTier tier,    // nullable
    int page,
    int size
) {}
