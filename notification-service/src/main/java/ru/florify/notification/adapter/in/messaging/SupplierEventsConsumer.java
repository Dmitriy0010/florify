package ru.florify.notification.adapter.in.messaging;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import ru.florify.notification.application.port.out.NotificationSenderPort;
import ru.florify.notification.domain.model.Channel;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class SupplierEventsConsumer {

    private final NotificationSenderPort notificationSender;

    public SupplierEventsConsumer(NotificationSenderPort notificationSender) {
        this.notificationSender = notificationSender;
        log.info("SupplierEventsConsumer initialized and listening for invoice events...");
    }

    @KafkaListener(topics = "suppliers.invoice.submitted", groupId = "notification-group")
    public void onInvoiceSubmitted(Map<String, Object> data) {
        log.info("---- KAFKA EVENT RECEIVED IN NOTIFICATIONS ----");
        
        try {
            String invoiceId = String.valueOf(data.get("invoiceId"));
            String invoiceNumber = String.valueOf(data.get("invoiceNumber"));
            String supplierName = String.valueOf(data.get("supplierName"));
            String supplierEmail = String.valueOf(data.get("supplierEmail"));
            Object itemsObj = data.get("items");
            String totalAmount = String.valueOf(data.get("totalAmount"));

            String displayInvoiceNum = (invoiceNumber != null && !invoiceNumber.equals("null")) 
                ? invoiceNumber 
                : (invoiceId.length() > 8 ? invoiceId.substring(0, 8) : invoiceId);

            String subject = "Новый заказ инвентаря №" + displayInvoiceNum;
            
            String htmlBody = buildHtmlBody(supplierName, displayInvoiceNum, itemsObj, totalAmount);

            if (supplierEmail != null && !supplierEmail.equals("null") && !supplierEmail.isBlank()) {
                notificationSender.send(Channel.EMAIL, supplierEmail, subject, htmlBody);
                log.info("Supplier notification sent to: {}", supplierEmail);
            } else {
                log.warn("Supplier email is missing for invoice {}, sending to admin fallback", invoiceId);
                notificationSender.send(Channel.EMAIL, "admin@florify.ru", subject, htmlBody);
            }
        } catch (Exception e) {
            log.error("Error processing notification event: {}", e.getMessage(), e);
        }
    }

    private String buildHtmlBody(String supplierName, String invoiceNum, Object itemsObj, String totalAmount) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div style='font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>");
        sb.append("<h2 style='color: #1a1a1a; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;'>Новый заказ Florify</h2>");
        sb.append("<p>Добрый день, <strong>").append(supplierName).append("</strong>!</p>");
        sb.append("<p>Для вас сформирован новый заказ инвентаря. Номер инвойса: <span style='background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-family: monospace;'>").append(invoiceNum).append("</span></p>");
        
        sb.append("<h3 style='margin-top: 30px; font-size: 16px; color: #666;'>Состав заказа:</h3>");
        sb.append("<table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>");
        sb.append("<thead style='background: #fafafa;'>");
        sb.append("<tr>");
        sb.append("<th style='padding: 10px; border: 1px solid #eee; text-align: left;'>Товар</th>");
        sb.append("<th style='padding: 10px; border: 1px solid #eee; text-align: center;'>Кол-во</th>");
        sb.append("<th style='padding: 10px; border: 1px solid #eee; text-align: right;'>Цена</th>");
        sb.append("<th style='padding: 10px; border: 1px solid #eee; text-align: right;'>Итого</th>");
        sb.append("</tr></thead><tbody>");

        if (itemsObj instanceof List) {
            List<Map<String, Object>> items = (List<Map<String, Object>>) itemsObj;
            for (Map<String, Object> item : items) {
                sb.append("<tr>");
                sb.append("<td style='padding: 10px; border: 1px solid #eee;'>").append(item.get("productName")).append("</td>");
                sb.append("<td style='padding: 10px; border: 1px solid #eee; text-align: center;'>").append(item.get("quantity")).append(" ").append(item.get("unit")).append("</td>");
                sb.append("<td style='padding: 10px; border: 1px solid #eee; text-align: right;'>").append(item.get("unitPrice")).append(" ₽</td>");
                sb.append("<td style='padding: 10px; border: 1px solid #eee; text-align: right;'>").append(item.get("totalLineAmount")).append(" ₽</td>");
                sb.append("</tr>");
            }
        }

        sb.append("</tbody></table>");
        
        sb.append("<div style='margin-top: 20px; text-align: right;'>");
        sb.append("<p style='font-size: 18px; font-weight: bold;'>Общая сумма: <span style='color: #2e7d32;'>").append(totalAmount).append(" ₽</span></p>");
        sb.append("</div>");

        sb.append("<p style='margin-top: 40px; color: #888; font-size: 12px;'>Пожалуйста, подтвердите получение и подготовьте поставку.<br>С уважением, команда <strong>Florify</strong>.</p>");
        sb.append("</div>");
        
        return sb.toString();
    }
}
