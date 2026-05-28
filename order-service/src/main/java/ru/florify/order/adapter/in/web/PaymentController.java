package ru.florify.order.adapter.in.web;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.florify.order.adapter.in.web.dto.PaymentSbpResponse;
import ru.florify.order.application.port.in.InitiatePaymentUseCase;
import ru.florify.order.domain.model.Payment;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final InitiatePaymentUseCase initiatePaymentUseCase;

    @PostMapping("/sbp/{orderId}")
    public ResponseEntity<PaymentSbpResponse> initiateSbpPayment(@PathVariable UUID orderId) {
        log.info("REST request to initiate SBP payment for order: {}", orderId);
        Payment payment = initiatePaymentUseCase.execute(orderId);
        return ResponseEntity.ok(new PaymentSbpResponse(
                payment.getId(),
                payment.getOrderId(),
                payment.getAmount(),
                payment.getQrCodeData(),
                payment.getConfirmationUrl(),
                payment.getStatus().name()
        ));
    }
}

