package ru.florify.notification.adapter.out.email;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import ru.florify.notification.application.port.out.NotificationSenderPort;
import ru.florify.notification.domain.model.Channel;

@Slf4j
@Component
@RequiredArgsConstructor
public class SmtpEmailSenderAdapter implements NotificationSenderPort {

    private final JavaMailSender mailSender;
    private final SmtpProperties properties;

    @Override
    public void send(Channel channel, String recipientContact, String subject, String body) {
        if (channel != Channel.EMAIL) {
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            
            helper.setTo(recipientContact);
            helper.setFrom(properties.getFrom());
            helper.setSubject(subject != null ? subject : "Уведомление Florify");
            
            // Set to true to enable HTML
            helper.setText(body != null ? body : "", true);

            mailSender.send(mimeMessage);
            log.info("Email sent successfully to {}", recipientContact);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", recipientContact, e.getMessage());
            throw new RuntimeException("Email sending failed", e);
        }
    }
}
