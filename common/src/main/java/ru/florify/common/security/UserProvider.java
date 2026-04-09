package ru.florify.common.security;

import java.util.UUID;

/**
 * Provides the currently authenticated user's ID to any application layer component.
 * <p>
 * Implementations read from the current thread's Spring Security Context,
 * which is populated by {@link JwtAuthenticationFilter}.
 * <p>
 * Using an interface here lets use-cases remain ignorant of Spring Security internals.
 */
public interface UserProvider {

    /**
     * Returns the UUID of the currently authenticated user.
     *
     * @throws ru.florify.common.exception.UnauthorizedException if no user is authenticated
     */
    UUID getCurrentUserId();
}
