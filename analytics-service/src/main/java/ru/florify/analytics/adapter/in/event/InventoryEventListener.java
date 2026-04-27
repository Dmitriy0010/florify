package ru.florify.analytics.adapter.in.event;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.analytics.adapter.in.event.mapper.InventoryEventMapper;
import ru.florify.analytics.application.port.in.RecordWriteoffFactUseCase;
import ru.florify.common.event.StockWrittenOffSpringEvent;

@Component
@RequiredArgsConstructor
public class InventoryEventListener {
    private final RecordWriteoffFactUseCase recordWriteoffFactUseCase;
    private final InventoryEventMapper mapper;

    @Async
    @EventListener
    @Transactional
    public void onStockWrittenOff(StockWrittenOffSpringEvent event) {
        recordWriteoffFactUseCase.record(mapper.toWriteoffCommand(event));
    }
}
