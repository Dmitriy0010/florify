package ru.florify.auth.application.port.out;

/**
 * Outbound port — password hashing contract.
 * Keeps BCrypt (or any other algorithm) as an adapter detail.
 */
public interface PasswordHasher {

    String hash(String rawPassword);

    boolean matches(String rawPassword, String hashedPassword);
}
