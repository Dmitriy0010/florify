package ru.florify.inventory.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import ru.florify.inventory.application.command.WriteOffCommand;
import ru.florify.inventory.domain.exception.NotFoundException;
import ru.florify.inventory.domain.model.StockBalance;
import ru.florify.inventory.domain.model.StockTransaction;
import ru.florify.inventory.domain.model.TransactionType;
import ru.florify.inventory.domain.port.out.StockBalanceLookupPort;
import ru.florify.inventory.domain.port.out.StockBalancePersistPort;
import ru.florify.inventory.domain.port.out.StockTransactionPort;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WriteOffStockInteractor {
    private final StockBalanceLookupPort balanceLookup;
    private final StockBalancePersistPort balancePersist;
    private final StockTransactionPort transactionPort;

    @Transactional
    public void execute(WriteOffCommand command) {
        // 1. Idempotency Check
        if (transactionPort.existsBySourceDocument(command.sourceDocumentId())) {
            return;
        }

        // 2. Fetch Balance
        StockBalance balance = balanceLookup.findByProductId(command.productId())
                .orElseThrow(() -> new NotFoundException("Stock balance not found for product: " + command.productId()));

        // 3. Fix costBasis BEFORE change
        BigDecimal costBasis = balance.getAverageCost();

        // 4. Update Balance (Rich Domain Logic checks internal quantity >= writeoff quantity)
        StockBalance updatedBalance = balance.writeOff(command.quantity());
        balancePersist.save(updatedBalance);

        // 5. Record Transaction
        StockTransaction transaction = new StockTransaction(
                UUID.randomUUID(),
                command.productId(),
                TransactionType.WRITE_OFF,
                command.quantity(),
                costBasis,
                command.quantity().multiply(costBasis),
                command.reason(),
                command.comment(),
                command.sourceDocumentId(),
                command.performerId(),
                Instant.now()
        );

        transactionPort.save(transaction);
    }
}
