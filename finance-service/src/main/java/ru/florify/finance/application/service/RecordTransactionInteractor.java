package ru.florify.finance.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.finance.application.command.RecordTransactionCommand;
import ru.florify.finance.application.port.in.RecordTransactionUseCase;
import ru.florify.finance.application.port.out.FinancialTransactionRepository;
import ru.florify.finance.domain.model.FinancialTransaction;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecordTransactionInteractor implements RecordTransactionUseCase {

    private final FinancialTransactionRepository repository;

    @Override
    @Transactional
    public void execute(RecordTransactionCommand command) {
        log.info("Recording financial transaction: type={}, amount={}, ref={}",
                command.type(), command.amount(), command.referenceId());

        FinancialTransaction transaction = FinancialTransaction.create(
                command.type(),
                command.amount(),
                command.referenceId(),
                command.description(),
                command.performerId(),
                command.occurredAt()
        );

        repository.save(transaction);

        log.info("Transaction recorded successfully: id={}", transaction.getId());
    }
}
