package ru.florify.auth.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.florify.auth.application.command.AssignRoleCommand;
import ru.florify.auth.application.port.in.AssignRoleUseCase;
import ru.florify.auth.application.port.out.UserRepository;
import ru.florify.auth.domain.model.Role;
import ru.florify.auth.domain.model.User;
import ru.florify.common.exception.NotFoundException;

import java.util.HashSet;
import java.util.Set;

/**
 * Interactor for assigning roles to users.
 * Redundant performer role check removed (handled by @PreAuthorize).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AssignRoleInteractor implements AssignRoleUseCase {

    private final UserRepository userRepository;

    @Override
    @Transactional
    @Retryable(maxAttempts = 3, retryFor = ObjectOptimisticLockingFailureException.class)
    public User execute(AssignRoleCommand command) {
        log.info("Assigning role {} to user {} by performer {}", 
                command.role(), command.targetUserId(), command.performerUserId());

        // Load target user
        User targetUser = userRepository.findById(command.targetUserId())
                .orElseThrow(() -> new NotFoundException("Target User", command.targetUserId()));

        Set<Role> newRoles = new HashSet<>(targetUser.roles());
        newRoles.add(command.role());

        User updatedUser = targetUser.withRoles(newRoles);

        log.debug("Roles updated for user {}: {}", command.targetUserId(), newRoles);

        return userRepository.save(updatedUser);
    }
}
