package ru.florify.inventory.adapter.in.web.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import ru.florify.inventory.adapter.in.web.dto.ReceiveStockRequest;
import ru.florify.inventory.adapter.in.web.dto.StockBalanceResponse;
import ru.florify.inventory.adapter.in.web.dto.WriteOffRequest;
import ru.florify.inventory.application.command.ReceiveStockCommand;
import ru.florify.inventory.application.command.WriteOffCommand;
import ru.florify.inventory.domain.model.StockBalance;

import java.util.UUID;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StockWebMapper {

    @Mapping(target = "performerId", source = "performerId")
    ReceiveStockCommand toCommand(ReceiveStockRequest request, UUID performerId);

    @Mapping(target = "performerId", source = "performerId")
    WriteOffCommand toCommand(WriteOffRequest request, UUID performerId);

    StockBalanceResponse toResponse(StockBalance balance);
}
