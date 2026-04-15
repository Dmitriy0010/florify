package ru.florify.inventory.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.inventory.application.port.out.*;
import ru.florify.inventory.domain.model.BatchStatus;
import ru.florify.inventory.domain.model.StockBalance;
import ru.florify.inventory.domain.model.StockBatch;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarkBatchesAsExpiredInteractorTest {

    @Mock private StockBatchRepository stockBatchRepository;
    @Mock private StockBalanceLookupPort balanceLookup;
    @Mock private StockBalancePersistPort balancePersist;
    @Mock private EventPublisher eventPublisher;
    @Mock private Clock clock;

    @InjectMocks
    private MarkBatchesAsExpiredInteractor interactor;

    private final Instant now = Instant.parse("2026-04-10T10:00:00Z");

    @BeforeEach
    void setUp() {
        lenient().when(clock.instant()).thenReturn(now);
        lenient().when(clock.getZone()).thenReturn(ZoneId.of("UTC"));
    }

    @Test
    @DisplayName("Should mark batches as EXPIRED and sync global balance")
    @SuppressWarnings("unchecked")
    void shouldExpireBatchesAndSyncBalance() {
        UUID productId = UUID.randomUUID();
        
        // Batch 1: Expired, has 10 units left
        StockBatch batch1 = StockBatch.builder()
                .id(UUID.randomUUID())
                .productId(productId)
                .quantityRemaining(new BigDecimal("10.00"))
                .expiresAt(now.minusSeconds(1))
                .status(BatchStatus.AVAILABLE)
                .build();

        // Batch 2: Expired, has 5 units left
        StockBatch batch2 = StockBatch.builder()
                .id(UUID.randomUUID())
                .productId(productId)
                .quantityRemaining(new BigDecimal("5.00"))
                .expiresAt(now.minusSeconds(100))
                .status(BatchStatus.AVAILABLE)
                .build();

        StockBalance existingBalance = new StockBalance(UUID.randomUUID(), productId, new BigDecimal("100.00"), new BigDecimal("10.00"), 0);

        when(stockBatchRepository.findExpiredBatches(now)).thenReturn(List.of(batch1, batch2));
        when(balanceLookup.findByProductId(productId)).thenReturn(Optional.of(existingBalance));

        int result = interactor.execute();

        assertEquals(2, result);

        // Verify Batches updated to EXPIRED
        ArgumentCaptor<List<StockBatch>> batchCaptor = ArgumentCaptor.forClass(List.class);
        verify(stockBatchRepository).saveAll(batchCaptor.capture());
        List<StockBatch> savedBatches = batchCaptor.getValue();
        assertEquals(BatchStatus.EXPIRED, savedBatches.get(0).getStatus());
        assertEquals(BatchStatus.EXPIRED, savedBatches.get(1).getStatus());

        // Verify Balance Sync (100 - 15 = 85)
        verify(balancePersist).save(argThat(balance -> balance.getQuantityInStock().compareTo(new BigDecimal("85.00")) == 0));

        // Verify Event published
        verify(eventPublisher).publish(any());
    }

    @Test
    @DisplayName("Should return 0 if no expired batches found")
    void shouldReturnZeroIfNoExpired() {
        when(stockBatchRepository.findExpiredBatches(now)).thenReturn(List.of());

        int result = interactor.execute();

        assertEquals(0, result);
        verify(stockBatchRepository, never()).saveAll(any());
        verifyNoInteractions(balanceLookup, balancePersist, eventPublisher);
    }
}
