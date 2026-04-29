package ru.florify.inventory.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.inventory.adapter.in.web.dto.WriteOffLogResponse;
import ru.florify.inventory.adapter.out.persistence.entity.StockTransactionJpaEntity;
import ru.florify.inventory.adapter.out.persistence.repository.StockTransactionJpaRepository;
import ru.florify.inventory.application.port.in.GetWriteOffLogsUseCase;
import ru.florify.inventory.domain.model.TransactionType;

import java.util.List;
import java.util.stream.Collectors;

import ru.florify.inventory.domain.model.WriteOffReason;

@Service
@RequiredArgsConstructor
public class GetWriteOffLogsInteractor implements GetWriteOffLogsUseCase {

    private final StockTransactionJpaRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<WriteOffLogResponse> execute() {
        Page<StockTransactionJpaEntity> page = repository.findByTypeAndWriteOffReasonNot(
            TransactionType.WRITE_OFF, 
            WriteOffReason.SALE,
            PageRequest.of(0, 100) // Default to latest 100 for now. Could add pagination.
        );

        return page.stream().map(entity -> new WriteOffLogResponse(
                entity.getId(),
                entity.getProductId(),
                entity.getStoreId(),
                entity.getQuantity(),
                entity.getTotalValue(),
                entity.getWriteOffReason() != null ? entity.getWriteOffReason().name() : "UNKNOWN",
                entity.getComment(),
                entity.getCreatedAt()
        )).collect(Collectors.toList());
    }
}
