package ru.florify.analytics.adapter.in.event.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.florify.analytics.application.command.RecordWriteoffFactCommand;
import ru.florify.common.event.StockWrittenOffSpringEvent;

@Mapper(componentModel = "spring")
public interface InventoryEventMapper {
    @Mapping(target = "sourceEventId", source = "sourceDocumentId")
    @Mapping(target = "storeId", source = "storeId")
    @Mapping(target = "writtenOffAt", source = "occurredAt")
    @Mapping(target = "quantity", source = "totalValue") // Map money to quantity as placeholder
    @Mapping(target = "productName", constant = "Unknown Product")
    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "categoryName", constant = "Unknown Category")
    @Mapping(target = "reason", source = "reason")
    RecordWriteoffFactCommand toWriteoffCommand(StockWrittenOffSpringEvent event);
}
