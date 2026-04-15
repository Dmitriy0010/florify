package ru.florify.auth.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.florify.auth.application.port.out.UserRepository;
import ru.florify.auth.domain.model.User;
import ru.florify.common.exception.NotFoundException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GetCurrentUserInteractorTest {

    @Mock private UserRepository userRepository;
    private GetCurrentUserInteractor interactor;

    @BeforeEach
    void setUp() {
        interactor = new GetCurrentUserInteractor(userRepository);
    }

    @Test
    @DisplayName("Should return user when found")
    void shouldReturnUser() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).email("test@mail.com").build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        User result = interactor.execute(userId);

        assertNotNull(result);
        assertEquals(userId, result.id());
    }

    @Test
    @DisplayName("Should throw NotFoundException when user not found")
    void shouldThrowNotFound() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> interactor.execute(userId));
    }
}
