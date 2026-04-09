package ru.florify.auth.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.auth.application.command.RegisterUserCommand;
import ru.florify.auth.application.port.in.RegisterUserUseCase;
import ru.florify.auth.domain.model.Role;
import ru.florify.auth.domain.model.User;
import ru.florify.auth.application.port.out.PasswordHasher;
import ru.florify.auth.application.port.out.UserRepository;
import ru.florify.common.exception.ConflictException;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

/**
 * Implementation of the registration use case.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RegisterUserInteractor implements RegisterUserUseCase {

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;

    @Override
    @Transactional
    public User execute(RegisterUserCommand command) {
        log.info("Registering new user with email: {}", command.email());

        if (userRepository.existsByEmail(command.email())) {
            throw new ConflictException("Email already taken: " + command.email());
        }

        String hashedPassword = passwordHasher.hash(command.password());

        User newUser = User.builder()
                .id(UUID.randomUUID())
                .email(command.email())
                .passwordHash(hashedPassword)
                .roles(Set.of(Role.CLIENT))
                .active(true)
                .createdAt(Instant.now())
                .build();

        return userRepository.save(newUser);
    }
}
