package ru.florify.auth.application.port.in;

import ru.florify.auth.domain.model.User;
import java.util.UUID;

public interface GetUserUseCase {
    User execute(UUID userId);
}
