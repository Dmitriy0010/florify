package ru.florify.analytics.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.application.command.ApplyCogsToOrderFactCommand;
import ru.florify.analytics.application.port.in.ApplyCogsToOrderFactUseCase;
import ru.florify.analytics.application.port.out.OrderFactRepository;

@Service
@RequiredArgsConstructor
public class ApplyCogsToOrderFactInteractor implements ApplyCogsToOrderFactUseCase {
    private final OrderFactRepository repository;

    @Override
    @Transactional
    public void apply(ApplyCogsToOrderFactCommand cmd) {
        repository.findByOrderId(cmd.orderId()).ifPresent(fact -> {
            fact.applyCogsUpdate(cmd.cogsAmount());
            repository.update(fact);
        });
    }
}
