package ru.florify.auth.domain.exception;

import ru.florify.common.exception.UnauthorizedException;

/**
 * Thrown when the provided email/password combination does not match any account.
 * Deliberately vague message — never reveal which field is wrong.
 * Maps to HTTP 401 via {@link ru.florify.common.web.GlobalExceptionHandler}.
 */
public class AuthCredentialsInvalidException extends UnauthorizedException {

    public AuthCredentialsInvalidException() {
        super("CREDENTIALS_INVALID", "Invalid email or password");
    }
}
