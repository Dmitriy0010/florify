package ru.florify.inventory.application.command;

import ru.florify.inventory.domain.model.ProductCategory;
import ru.florify.inventory.domain.model.UnitOfMeasure;

import java.math.BigDecimal;

public record CreateProductCommand(
        String name,
        String sku,
        ProductCategory category,
        UnitOfMeasure unit,
        BigDecimal retailPrice
) {}
