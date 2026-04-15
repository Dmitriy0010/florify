package ru.florify.catalog.application.port.in;

import ru.florify.catalog.application.command.UpdatePriceCommand;
import ru.florify.catalog.domain.model.Product;

public interface UpdatePriceUseCase {
    Product execute(UpdatePriceCommand command);
}
