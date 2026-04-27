package ru.florify.inventory.adapter.in.web.mapper;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import ru.florify.inventory.adapter.in.web.dto.ReceiveStockRequest;
import ru.florify.inventory.adapter.in.web.dto.StockBalanceResponse;
import ru.florify.inventory.adapter.in.web.dto.WriteOffRequest;
import ru.florify.inventory.application.command.ReceiveStockCommand;
import ru.florify.inventory.application.command.WriteOffCommand;
import ru.florify.inventory.domain.model.StockBalance;
import ru.florify.inventory.domain.model.WriteOffReason;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-27T12:26:00+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class StockWebMapperImpl implements StockWebMapper {

    @Override
    public ReceiveStockCommand toCommand(ReceiveStockRequest request, UUID performerId) {
        if ( request == null && performerId == null ) {
            return null;
        }

        UUID productId = null;
        BigDecimal quantity = null;
        BigDecimal purchasePrice = null;
        String sourceDocumentId = null;
        if ( request != null ) {
            productId = request.productId();
            quantity = request.quantity();
            purchasePrice = request.purchasePrice();
            sourceDocumentId = request.sourceDocumentId();
        }
        UUID performerId1 = null;
        performerId1 = performerId;

        Instant expiresAt = null;

        ReceiveStockCommand receiveStockCommand = new ReceiveStockCommand( productId, quantity, purchasePrice, sourceDocumentId, performerId1, expiresAt );

        return receiveStockCommand;
    }

    @Override
    public WriteOffCommand toCommand(WriteOffRequest request, UUID performerId) {
        if ( request == null && performerId == null ) {
            return null;
        }

        UUID productId = null;
        BigDecimal quantity = null;
        WriteOffReason reason = null;
        String comment = null;
        String sourceDocumentId = null;
        if ( request != null ) {
            productId = request.productId();
            quantity = request.quantity();
            reason = request.reason();
            comment = request.comment();
            sourceDocumentId = request.sourceDocumentId();
        }
        UUID performerId1 = null;
        performerId1 = performerId;

        WriteOffCommand writeOffCommand = new WriteOffCommand( productId, quantity, reason, comment, sourceDocumentId, performerId1 );

        return writeOffCommand;
    }

    @Override
    public StockBalanceResponse toResponse(StockBalance balance) {
        if ( balance == null ) {
            return null;
        }

        UUID productId = null;
        BigDecimal quantityInStock = null;
        BigDecimal averageCost = null;

        productId = balance.getProductId();
        quantityInStock = balance.getQuantityInStock();
        averageCost = balance.getAverageCost();

        StockBalanceResponse stockBalanceResponse = new StockBalanceResponse( productId, quantityInStock, averageCost );

        return stockBalanceResponse;
    }
}
