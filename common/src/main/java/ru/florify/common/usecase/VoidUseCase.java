package ru.florify.common.usecase;

/**
 * Functional interface for use-cases that do not return a result.
 *
 * @param <C> Command (input DTO)
 */
@FunctionalInterface
public interface VoidUseCase<C> {
    void execute(C command);
}
