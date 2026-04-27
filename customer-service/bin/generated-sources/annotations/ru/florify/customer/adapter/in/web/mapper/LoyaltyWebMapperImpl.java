package ru.florify.customer.adapter.in.web.mapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.customer.adapter.in.web.dto.LoyaltyAccountResponse;
import ru.florify.customer.adapter.in.web.dto.LoyaltyTransactionResponse;
import ru.florify.customer.domain.enums.LoyaltyTier;
import ru.florify.customer.domain.enums.LoyaltyTxType;
import ru.florify.customer.domain.model.LoyaltyAccount;
import ru.florify.customer.domain.model.LoyaltyTransaction;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-27T12:25:53+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class LoyaltyWebMapperImpl implements LoyaltyWebMapper {

    @Override
    public LoyaltyAccountResponse toResponse(LoyaltyAccount domain) {
        if ( domain == null ) {
            return null;
        }

        UUID id = null;
        UUID customerId = null;
        LoyaltyTier tier = null;
        int pointsBalance = 0;
        int reservedPoints = 0;
        BigDecimal totalSpent = null;
        Instant updatedAt = null;

        id = domain.getId();
        customerId = domain.getCustomerId();
        tier = domain.getTier();
        pointsBalance = domain.getPointsBalance();
        reservedPoints = domain.getReservedPoints();
        totalSpent = domain.getTotalSpent();
        updatedAt = domain.getUpdatedAt();

        int availablePoints = domain.availablePoints();

        LoyaltyAccountResponse loyaltyAccountResponse = new LoyaltyAccountResponse( id, customerId, tier, pointsBalance, reservedPoints, availablePoints, totalSpent, updatedAt );

        return loyaltyAccountResponse;
    }

    @Override
    public LoyaltyTransactionResponse toResponse(LoyaltyTransaction domain) {
        if ( domain == null ) {
            return null;
        }

        UUID id = null;
        UUID orderId = null;
        LoyaltyTxType type = null;
        int points = 0;
        String description = null;
        Instant occurredAt = null;

        id = domain.id();
        orderId = domain.orderId();
        type = domain.type();
        points = domain.points();
        description = domain.description();
        occurredAt = domain.occurredAt();

        LoyaltyTransactionResponse loyaltyTransactionResponse = new LoyaltyTransactionResponse( id, orderId, type, points, description, occurredAt );

        return loyaltyTransactionResponse;
    }
}
