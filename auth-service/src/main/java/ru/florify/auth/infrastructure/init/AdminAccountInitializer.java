package ru.florify.auth.infrastructure.init;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import ru.florify.auth.application.port.out.PasswordHasher;
import ru.florify.auth.application.port.out.UserRepository;
import ru.florify.auth.domain.model.Role;
import ru.florify.auth.domain.model.User;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

/**
 * Bootstraps a default administrator account if the database is empty.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminAccountInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;

    private static final String DEFAULT_ADMIN_EMAIL = "admin@florify.ru";
    private static final String DEFAULT_ADMIN_PASSWORD = "admin123";

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail(DEFAULT_ADMIN_EMAIL)) {
            log.debug("Default administrator account already exists.");
            // Update name if it's still the default "System Administrator"
            userRepository.findByEmail(DEFAULT_ADMIN_EMAIL).ifPresent(user -> {
                if ("System".equals(user.firstName()) || "System A".equals(user.firstName())) {
                    log.info("Updating legacy '{}' admin name to 'Дмитрий'", user.firstName());
                    User updatedUser = User.builder()
                            .id(user.id())
                            .email(user.email())
                            .phone(user.phone())
                            .firstName("Дмитрий")
                            .lastName("Админ")
                            .passwordHash(user.passwordHash())
                            .roles(user.roles())
                            .active(user.active())
                            .createdAt(user.createdAt())
                            .build();
                    userRepository.save(updatedUser);
                }
            });
            return;
        }

        log.info("No administrative account found. Bootstrapping default OWNER: {}", DEFAULT_ADMIN_EMAIL);

        try {
            User adminUser = User.builder()
                    .id(UUID.randomUUID())
                    .email(DEFAULT_ADMIN_EMAIL)
                    .firstName("Дмитрий")
                    .lastName("Админ")
                    .passwordHash(passwordHasher.hash(DEFAULT_ADMIN_PASSWORD))
                    .roles(Set.of(Role.OWNER))
                    .active(true)
                    .createdAt(Instant.now())
                    .build();

            userRepository.save(adminUser);
            
            log.info("************************************************************");
            log.info("DEFAULT ADMINISTRATOR ACCOUNT CREATED");
            log.info("Email: {}", DEFAULT_ADMIN_EMAIL);
            log.info("Password: {}", DEFAULT_ADMIN_PASSWORD);
            log.info("PLEASE CHANGE THIS PASSWORD AFTER FIRST LOGIN");
            log.info("************************************************************");
        } catch (Exception e) {
            log.error("Failed to bootstrap default administrator account", e);
        }
    }
}
