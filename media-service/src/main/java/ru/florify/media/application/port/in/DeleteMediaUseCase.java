package ru.florify.media.application.port.in;

import ru.florify.media.application.command.DeleteMediaCommand;

public interface DeleteMediaUseCase {
    void delete(DeleteMediaCommand command);
}
