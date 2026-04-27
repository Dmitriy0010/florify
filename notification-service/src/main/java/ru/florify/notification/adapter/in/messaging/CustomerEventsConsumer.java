package ru.florify.notification.adapter.in.messaging;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import ru.florify.common.event.BirthdayAlertEvent;
import ru.florify.common.event.TierUpgradedEvent;
import org.springframework.stereotype.Component;
import ru.florify.notification.application.command.SendNotificationCommand;
import ru.florify.notification.application.port.in.SendNotificationUseCase;
import ru.florify.notification.domain.model.Channel;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CustomerEventsConsumer {

    private final SendNotificationUseCase sendNotificationUseCase;

    @EventListener
    public void onBirthdayAlert(BirthdayAlertEvent event) {
        Map<String, Object> data = Map.of(
                "customerId", event.customerId(),
                "phone", event.phone(),
                "firstName", event.firstName()
        );
        sendNotificationUseCase.send(new SendNotificationCommand(
                "CUSTOMER_BIRTHDAY_ALERT",
                Channel.TELEGRAM,
                event.customerId(),
                data,
                null
        ));
    }

    @EventListener
    public void onTierUpgraded(TierUpgradedEvent event) {
        Map<String, Object> data = Map.of(
                "customerId", event.customerId(),
                "previousTier", event.previousTier(),
                "newTier", event.newTier()
        );
        sendNotificationUseCase.send(new SendNotificationCommand(
                "CUSTOMER_TIER_UPGRADED",
                Channel.EMAIL,
                event.customerId(),
                data,
                null
        ));
    }
}

