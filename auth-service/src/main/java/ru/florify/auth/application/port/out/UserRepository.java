package ru.florify.auth.application.port.out;

import ru.florify.auth.domain.model.User;

import java.util.Optional;
import java.util.UUID;

/**
 * Outbound port — persistence contract for {@link User}.
 * The application layer depends only on this interface; JPA is an implementation detail.
 */
public interface UserRepository {

    User save(User user);

    Optional<User> findById(UUID id);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);
}
