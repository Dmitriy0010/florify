package ru.florify.analytics.adapter.in.event.mapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.analytics.application.command.RecordWriteoffFactCommand;
import ru.florify.analytics.domain.enums.WriteoffReason;
import ru.florify.common.event.StockWrittenOffSpringEvent;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-05T13:18:47+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class InventoryEventMapperImpl implements InventoryEventMapper {

    @Override
    public RecordWriteoffFactCommand toWriteoffCommand(StockWrittenOffSpringEvent event) {
        if ( event == null ) {
            return null;
        }

        UUID sourceEventId = null;
        UUID storeId = null;
        Instant writtenOffAt = null;
        BigDecimal quantity = null;
        WriteoffReason reason = null;
        UUID productId = null;

        sourceEventId = event.sourceDocumentId();
        storeId = event.storeId();
        writtenOffAt = event.occurredAt();
        quantity = event.totalValue();
        if ( event.reason() != null ) {
            reason = Enum.valueOf( WriteoffReason.class, event.reason() );
        }
        productId = event.productId();

        String productName = "Unknown Product";
        UUID categoryId = null;
        String categoryName = "Unknown Category";

        RecordWriteoffFactCommand recordWriteoffFactCommand = new RecordWriteoffFactCommand( sourceEventId, productId, storeId, productName, categoryId, categoryName, quantity, reason, writtenOffAt );

        return recordWriteoffFactCommand;
    }
}
