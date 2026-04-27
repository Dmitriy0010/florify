package ru.florify.order.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.order.application.command.UpdateOrderStatusCommand;
import ru.florify.order.application.port.in.ConfirmPaymentUseCase;
import ru.florify.order.application.port.in.UpdateOrderStatusUseCase;
import ru.florify.order.application.port.out.OrderRepository;
import ru.florify.order.application.port.out.PaymentRepository;
import ru.florify.order.domain.exception.OrderNotFoundException;
import ru.florify.order.domain.model.Order;
import ru.florify.order.domain.model.OrderStatus;
import ru.florify.order.domain.model.Payment;
import ru.florify.order.domain.model.PaymentStatus;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConfirmPaymentInteractor implements ConfirmPaymentUseCase {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UpdateOrderStatusUseCase updateOrderStatusUseCase;
    private final Clock clock;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public void execute(String externalId) {
        log.info("Confirming payment by external ID: {}", externalId);
        Payment payment = paymentRepository.findByExternalId(externalId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + externalId));

        processConfirmation(payment);
    }

    @Override
    @Transactional
    public void executeByOrderId(UUID orderId) {
        log.info("Simulating payment confirmation for order: {}", orderId);
        
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        if (order.isPaid()) {
            log.info("Order {} is already paid", orderId);
            return;
        }

        // Пытаемся найти последний платеж или создаем фиктивный для симуляции
        Payment payment = paymentRepository.findLatestByOrderId(orderId)
                .orElseGet(() -> {
                    log.info("No payment found for order {}, creating a dummy one for simulation", orderId);
                    Payment dummy = Payment.createNew(
                            orderId,
                            order.getFinalAmount(),
                            "SIM-" + order.getOrderNumber() + "-" + UUID.randomUUID().toString().substring(0, 8),
                            null,
                            null,
                            clock.instant()
                    );
                    return paymentRepository.save(dummy);
                });

        processConfirmation(payment);
    }

    private void processConfirmation(Payment payment) {
        if (payment.getStatus() == PaymentStatus.SUCCEEDED) {
            log.info("Payment {} already succeeded", payment.getExternalId());
            return;
        }

        Instant now = clock.instant();
        Payment succeededPayment = payment.succeed(now);
        paymentRepository.save(succeededPayment);

        // Update Order
        Order order = orderRepository.findByIdWithItems(payment.getOrderId())
                .orElseThrow(() -> new OrderNotFoundException(payment.getOrderId()));
        
        Order updatedOrder = order.associatePayment(payment, now)
                .markAsPaid(now);
        
        // Автоматически завершаем заказ, если это POS-продажа
        if (updatedOrder.getSource() == ru.florify.order.domain.model.OrderSource.POS) {
            updatedOrder = updatedOrder.complete(updatedOrder.getFloristId(), now);
        }
        
        orderRepository.save(updatedOrder);

        // Публикуем событие для WebSocket (будет создано в следующем шаге)
        eventPublisher.publishEvent(new ru.florify.order.domain.event.PaymentSucceededEvent(
                updatedOrder.getId(),
                updatedOrder.getOrderNumber(),
                updatedOrder.isPaid()
        ));
        
        log.info("Order {} marked as paid and updated", updatedOrder.getId());
    }
}
