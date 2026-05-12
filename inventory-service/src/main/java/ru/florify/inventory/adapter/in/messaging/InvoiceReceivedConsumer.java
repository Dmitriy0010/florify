package ru.florify.inventory.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import ru.florify.inventory.application.command.ReceiveStockCommand;
import ru.florify.inventory.application.port.in.ReceiveStockUseCase;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class InvoiceReceivedConsumer {

    private final ReceiveStockUseCase receiveStockUseCase;

    @KafkaListener(topics = "suppliers.invoice.received", groupId = "inventory-notification-group")
    public void onInvoiceReceived(Object payload) {
        log.info("---- KAFKA EVENT RECEIVED IN INVENTORY ----");
        log.info("Raw payload class: {}", payload != null ? payload.getClass().getName() : "null");
        
        try {
            Object actualPayload = payload;
            if (payload instanceof org.apache.kafka.clients.consumer.ConsumerRecord<?, ?> record) {
                actualPayload = record.value();
            }
            
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            Map<String, Object> data = mapper.convertValue(actualPayload, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
            log.info("Raw data: {}", data);
            String invoiceId = String.valueOf(data.get("invoiceId"));
            String storeIdStr = String.valueOf(data.get("storeId"));
        
            if (storeIdStr == null || storeIdStr.equals("null")) {
                log.warn("Missing storeId in InvoiceReceivedEvent for invoice: {}", invoiceId);
                return;
            }

            UUID storeId = UUID.fromString(storeIdStr);
            List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");

            if (items == null) {
                log.warn("No items found in InvoiceReceivedEvent for invoice: {}", invoiceId);
                return;
            }

            String supplierIdStr = data.get("supplierId") != null ? String.valueOf(data.get("supplierId")) : null;
            UUID supplierId = supplierIdStr != null && !supplierIdStr.equals("null") ? UUID.fromString(supplierIdStr) : null;

            for (Map<String, Object> item : items) {
                UUID productId = UUID.fromString(String.valueOf(item.get("productId")));
                BigDecimal quantity = new BigDecimal(String.valueOf(item.get("quantity")));
                BigDecimal purchasePrice = new BigDecimal(String.valueOf(item.get("purchasePrice")));
                
                log.info("Adding stock: product={}, qty={}, store={}", productId, quantity, storeId);
                
                receiveStockUseCase.execute(new ReceiveStockCommand(
                        productId,
                        storeId,
                        supplierId,
                        quantity,
                        purchasePrice,
                        "INV-" + (invoiceId.length() > 8 ? invoiceId.substring(0, 8) : invoiceId),
                        null, 
                        null
                ));
            }
            log.info("Successfully processed inventory update for invoice: {}", invoiceId);
        } catch (Exception e) {
            log.error("Error processing inventory event: {}", e.getMessage(), e);
        }
    }
}
