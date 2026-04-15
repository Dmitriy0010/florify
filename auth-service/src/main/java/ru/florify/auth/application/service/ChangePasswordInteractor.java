package ru.florify.auth.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.auth.application.command.ChangePasswordCommand;
import ru.florify.auth.application.port.in.ChangePasswordUseCase;
import ru.florify.auth.application.port.out.PasswordHasher;
import ru.florify.auth.application.port.out.RefreshTokenRepository;
import ru.florify.auth.application.port.out.UserRepository;
import ru.florify.auth.domain.exception.AuthCredentialsInvalidException;
import ru.florify.auth.domain.model.User;
import ru.florify.common.exception.NotFoundException;

@Service
@RequiredArgsConstructor
@Transactional
public class ChangePasswordInteractor implements ChangePasswordUseCase {
    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    public Void execute(ChangePasswordCommand command) {
        User user = userRepository.findById(command.userId())
                .orElseThrow(() -> new NotFoundException("User", command.userId()));

        if (!passwordHasher.matches(command.currentPassword(), user.passwordHash())) {
            throw new AuthCredentialsInvalidException();
        }

        String newHash = passwordHasher.hash(command.newPassword());
        User updated = user.withPasswordHash(newHash);
        
        userRepository.save(updated);

        // Invalidate all tokens for this user across all devices
        refreshTokenRepository.revokeAllByUserId(command.userId());
        return null;
    }
}
