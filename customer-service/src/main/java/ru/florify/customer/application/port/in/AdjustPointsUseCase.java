package ru.florify.customer.application.port.in;

import java.util.UUID;

public interface AdjustPointsUseCase {
    void execute(AdjustPointsCommand command);

    record AdjustPointsCommand(
        UUID customerId,
        int points,
        String type, // EARN or WITHDRAW
        String description
    ) {}
}
