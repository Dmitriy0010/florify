package ru.florify.auth.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.auth.application.command.AssignRoleCommand;
import ru.florify.auth.application.port.out.UserRepository;
import ru.florify.auth.domain.model.Role;
import ru.florify.auth.domain.model.User;
import ru.florify.common.exception.NotFoundException;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssignRoleInteractorTest {

    @Mock private UserRepository userRepository;
    private AssignRoleInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new AssignRoleInteractor(userRepository);
    }
    @Test
    @DisplayName("Should successfully assign role")
    void shouldAssignRoleSuccessfully() {
        UUID ownerId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        User target = User.builder().id(targetId).roles(Set.of(Role.CUSTOMER)).build();

        when(userRepository.findById(targetId)).thenReturn(Optional.of(target));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        var command = new AssignRoleCommand(targetId, Role.ADMIN, ownerId);
        User result = interactor.execute(command);

        assertTrue(result.roles().contains(Role.ADMIN));
        verify(userRepository).save(any());
        verify(userRepository, never()).findById(ownerId);
    }
}
