package ru.florify.analytics.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.application.command.RecordWriteoffFactCommand;
import ru.florify.analytics.application.port.in.RecordWriteoffFactUseCase;
import ru.florify.analytics.application.port.out.WriteoffFactRepository;
import ru.florify.analytics.domain.model.WriteoffFact;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecordWriteoffFactInteractor implements RecordWriteoffFactUseCase {
    private final WriteoffFactRepository repository;

    @Override
    @Transactional
    public void record(RecordWriteoffFactCommand cmd) {
        if (repository.existsBySourceEventId(cmd.sourceEventId())) {
            return;
        }
        WriteoffFact fact = WriteoffFact.builder()
                .id(UUID.randomUUID())
                .sourceEventId(cmd.sourceEventId())
                .productId(cmd.productId())
                .storeId(cmd.storeId())
                .productName(cmd.productName())
                .categoryId(cmd.categoryId())
                .categoryName(cmd.categoryName())
                .quantity(cmd.quantity())
                .reason(cmd.reason())
                .writtenOffAt(cmd.writtenOffAt())
                .recordedAt(Instant.now())
                .build();
        repository.save(fact);
    }
}
