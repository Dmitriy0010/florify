package ru.florify.catalog.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.florify.catalog.application.command.BulkPriceUpdateCommand;
import ru.florify.catalog.application.command.UpdatePriceCommand;
import ru.florify.catalog.application.port.in.BulkPriceUpdateUseCase;
import ru.florify.catalog.application.port.in.UpdatePriceUseCase;
import ru.florify.catalog.application.port.out.ProductRepository;
import ru.florify.catalog.domain.model.Product;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BulkPriceUpdateInteractor implements BulkPriceUpdateUseCase {

    private final ProductRepository productRepository;
    private final UpdatePriceUseCase updatePriceUseCase;
    private final Clock clock;

    @Override
    public void execute(BulkPriceUpdateCommand command) {
        List<Product> products = productRepository.findByCategoryId(command.categoryId());
        
        for (Product product : products) {
            BigDecimal multiplier = BigDecimal.ONE.add(
                command.markupPercent().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)
            );
            BigDecimal newPrice = product.getCurrentPrice()
                .multiply(multiplier)
                .setScale(2, RoundingMode.HALF_UP);

            // Each product update is a separate transaction within UpdatePriceInteractor
            updatePriceUseCase.execute(new UpdatePriceCommand(
                product.getId(), 
                newPrice,
                "Bulk update for category " + command.categoryId(),
                command.performerId()
            ));
        }
    }
}
