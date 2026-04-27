package ru.florify.customer.adapter.in.web.dto;

import java.util.List;

public record LoyaltyStatsResponse(
        long totalEarnedPoints,
        long totalSpentPoints,
        long activePoints,
        List<LoyaltyTransactionResponse> recentTransactions
) {
}
