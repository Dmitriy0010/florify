package ru.florify.order.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.order.application.port.in.InitiatePaymentUseCase;
import ru.florify.order.application.port.out.OrderRepository;
import ru.florify.order.application.port.out.PaymentGateway;
import ru.florify.order.application.port.out.PaymentRepository;
import ru.florify.order.domain.exception.OrderNotFoundException;
import ru.florify.order.domain.model.Order;
import ru.florify.order.domain.model.Payment;

import java.time.Clock;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InitiatePaymentInteractor implements InitiatePaymentUseCase {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentGateway paymentGateway;
    private final Clock clock;

    @Override
    @Transactional
    public Payment execute(UUID orderId) {
        log.info("Initiating payment for order {}", orderId);
        
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        // Create transaction through gateway (external call)
        Payment payment = paymentGateway.createPayment(
                order.getId(),
                order.getFinalAmount(),
                "Оплата заказа №" + order.getOrderNumber()
        );

        // Save payment to DB
        Payment savedPayment = paymentRepository.save(payment);

        // Associate with order
        Order updatedOrder = order.associatePayment(savedPayment, clock.instant());
        orderRepository.save(updatedOrder);

        return savedPayment;
    }
}
