package ru.florify.inventory.presentation.rest;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import ru.florify.inventory.application.command.ReceiveStockCommand;
import ru.florify.inventory.application.command.WriteOffCommand;
import ru.florify.inventory.application.service.ReceiveStockInteractor;
import ru.florify.inventory.application.service.WriteOffStockInteractor;
import ru.florify.inventory.presentation.rest.dto.ReceiveStockRequest;
import ru.florify.inventory.presentation.rest.dto.WriteOffRequest;
import jakarta.validation.Valid;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class StockController {
    private final ReceiveStockInteractor receiveStockInteractor;
    private final WriteOffStockInteractor writeOffStockInteractor;

    @PostMapping("/receive")
    public ResponseEntity<Void> receiveStock(
            @Valid @RequestBody ReceiveStockRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        // Extract performerId from JWT as planned
        UUID performerId = UUID.fromString(jwt.getSubject());
        
        ReceiveStockCommand enrichedCommand = new ReceiveStockCommand(
                request.productId(),
                request.quantity(),
                request.purchasePrice(),
                request.sourceDocumentId(),
                performerId
        );
        
        receiveStockInteractor.execute(enrichedCommand);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/write-off")
    public ResponseEntity<Void> writeOffStock(
            @Valid @RequestBody WriteOffRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        UUID performerId = UUID.fromString(jwt.getSubject());

        WriteOffCommand enrichedCommand = new WriteOffCommand(
                request.productId(),
                request.quantity(),
                request.reason(),
                request.comment(),
                request.sourceDocumentId(),
                performerId
        );

        writeOffStockInteractor.execute(enrichedCommand);
        return ResponseEntity.ok().build();
    }
}
