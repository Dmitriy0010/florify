package ru.florify.inventory.application.port.out;

import ru.florify.inventory.domain.model.StockBalance;

public interface StockBalancePersistPort {
    StockBalance save(StockBalance balance);
}
