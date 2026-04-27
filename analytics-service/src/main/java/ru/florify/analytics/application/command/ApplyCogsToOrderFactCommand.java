package ru.florify.analytics.application.command;

import java.math.BigDecimal;
import java.util.UUID;

public record ApplyCogsToOrderFactCommand(UUID orderId, BigDecimal cogsAmount) {
}
