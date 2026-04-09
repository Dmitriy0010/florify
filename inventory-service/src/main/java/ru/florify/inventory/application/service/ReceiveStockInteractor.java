package ru.florify.inventory.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import ru.florify.inventory.application.command.ReceiveStockCommand;
import ru.florify.inventory.domain.exception.InactiveProductException;
import ru.florify.inventory.domain.exception.NotFoundException;
import ru.florify.inventory.domain.model.Product;
import ru.florify.inventory.domain.model.StockBalance;
import ru.florify.inventory.domain.model.StockTransaction;
import ru.florify.inventory.domain.model.TransactionType;
import ru.florify.inventory.domain.port.out.*;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReceiveStockInteractor {
    private final ProductLookupPort productLookup;
    private final StockBalanceLookupPort balanceLookup;
    private final StockBalancePersistPort balancePersist;
    private final StockTransactionPort transactionPort;

    @Transactional
    public void execute(ReceiveStockCommand command) {
        // 1. Idempotency Check
        if (transactionPort.existsBySourceDocument(command.sourceDocumentId())) {
            return;
        }

        // 2. Fetch Product (Administrative look up, findById includes inactive)
        Product product = productLookup.findById(command.productId())
                .orElseThrow(() -> new NotFoundException("Product not found: " + command.productId()));

        // 3. Status check
        if (!product.isActive()) {
            throw new InactiveProductException("Cannot receive stock for inactive product: " + command.productId());
        }

        // 4. Fetch/Create Balance
        StockBalance balance = balanceLookup.findByProductId(command.productId())
                .orElseGet(() -> StockBalance.createEmpty(command.productId()));

        // 5. Update Balance (Rich Domain Logic)
        StockBalance updatedBalance = balance.receive(command.quantity(), command.purchasePrice());
        balancePersist.save(updatedBalance);

        // 6. Record Transaction
        StockTransaction transaction = StockTransaction.forInbound(
                command.productId(),
                command.quantity(),
                command.purchasePrice(),
                command.sourceDocumentId(),
                command.performerId()
        );
        
        transactionPort.save(transaction);
    }
}
