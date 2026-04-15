package ru.florify.auth.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.auth.application.port.in.GetCurrentUserUseCase;
import ru.florify.auth.application.port.out.UserRepository;
import ru.florify.auth.domain.model.User;
import ru.florify.common.exception.NotFoundException;

import java.util.UUID;

/**
 * Interactor for fetching current user data.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GetCurrentUserInteractor implements GetCurrentUserUseCase {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public User execute(UUID userId) {
        log.info("Fetching current user data for ID: {}", userId);
        
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User", userId));
    }
}
