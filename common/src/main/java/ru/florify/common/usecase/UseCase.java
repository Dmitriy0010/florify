package ru.florify.common.usecase;

/**
 * Generic contract for all use-case interactors in Florify.
 *
 * @param <C> Command (input DTO)
 * @param <R> Result (output)
 */
public interface UseCase<C, R> {

    R execute(C command);
}
