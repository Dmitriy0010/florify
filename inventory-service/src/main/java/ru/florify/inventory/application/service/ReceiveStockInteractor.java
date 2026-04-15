package ru.florify.inventory.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.common.exception.NotFoundException;
import ru.florify.inventory.application.command.ReceiveStockCommand;
import ru.florify.inventory.application.port.in.ReceiveStockUseCase;
import ru.florify.inventory.application.port.out.*;
import ru.florify.inventory.domain.exception.InactiveProductException;
import ru.florify.inventory.domain.event.StockReceivedEvent;
import ru.florify.inventory.domain.model.*;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReceiveStockInteractor implements ReceiveStockUseCase {

    private final ProductLookupPort productLookup;
    private final StockBalanceLookupPort balanceLookup;
    private final StockBalancePersistPort balancePersist;
    private final StockBatchRepository stockBatchRepository;
    private final StockTransactionPort transactionPort;
    private final EventPublisher eventPublisher;
    private final Clock clock;

    @Override
    @Transactional
    @Retryable(
            maxAttempts = 3,
            retryFor = ObjectOptimisticLockingFailureException.class,
            backoff = @Backoff(delay = 100, multiplier = 2)
    )
    public void execute(ReceiveStockCommand command) {
        log.info("Receiving FIFO stock for productId: {}, qty: {}", command.productId(), command.quantity());

        // 1. Idempotency Check
        if (transactionPort.existsBySourceDocument(command.sourceDocumentId())) {
            log.warn("Idempotency skip: sourceDocument {} already processed", command.sourceDocumentId());
            return;
        }

        // 2. Fetch Product
        ProductSnapshot product = productLookup.findById(command.productId())
                .orElseThrow(() -> new NotFoundException("ProductSnapshot", command.productId()));

        if (!product.isActive()) {
            throw new InactiveProductException("Cannot receive stock for inactive product: " + command.productId());
        }

        Instant now = Instant.now(clock);

        // 3. Create NEW StockBatch (FIFO tracking)
        StockBatch newBatch = StockBatch.builder()
                .id(UUID.randomUUID())
                .productId(command.productId())
                .quantityReceived(command.quantity())
                .quantityRemaining(command.quantity())
                .unitCost(command.purchasePrice())
                .receivedAt(now)
                .expiresAt(command.expiresAt())
                .status(BatchStatus.AVAILABLE)
                .sourceDocumentId(command.sourceDocumentId())
                .version(0)
                .build();
        
        stockBatchRepository.save(newBatch);

        // 4. Update Aggregate StockBalance
        StockBalance balance = balanceLookup.findByProductId(command.productId())
                .orElseGet(() -> StockBalance.createEmpty(command.productId()));

        StockBalance updatedBalance = balance.receive(command.quantity(), command.purchasePrice());
        balancePersist.save(updatedBalance);

        // 5. Record Transaction (Audit)
        StockTransaction transaction = StockTransaction.forInbound(
                command.productId(),
                command.quantity(),
                command.purchasePrice(),
                command.sourceDocumentId(),
                command.performerId(),
                now
        );
        transactionPort.save(transaction);

        // 6. Publish Event (Bug fix #3)
        eventPublisher.publish(StockReceivedEvent.of(
                newBatch.getId(), 
                command.productId(), 
                command.quantity(), 
                command.purchasePrice(), 
                now
        ));
    }
}
