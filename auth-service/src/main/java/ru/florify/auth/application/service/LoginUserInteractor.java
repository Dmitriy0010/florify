package ru.florify.auth.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.auth.application.command.LoginUserCommand;
import ru.florify.auth.application.port.in.LoginUserUseCase;
import ru.florify.auth.domain.exception.AuthCredentialsInvalidException;
import ru.florify.auth.domain.model.User;
import ru.florify.auth.application.port.out.PasswordHasher;
import ru.florify.auth.application.port.out.UserRepository;
import ru.florify.common.exception.ForbiddenException;

/**
 * Implementation of the login use case.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginUserInteractor implements LoginUserUseCase {

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;

    @Override
    @Transactional(readOnly = true)
    public User execute(LoginUserCommand command) {
        log.info("Attempting login for email: {}", command.email());

        User user = userRepository.findByEmail(command.email())
                .orElseThrow(AuthCredentialsInvalidException::new);

        if (!passwordHasher.matches(command.password(), user.getPasswordHash())) {
            throw new AuthCredentialsInvalidException();
        }

        if (!user.isActive()) {
            throw new ForbiddenException("Account is deactivated");
        }

        return user;
    }
}
