package ru.florify.media.application.port.in;

import ru.florify.media.application.command.UploadMediaCommand;
import ru.florify.media.domain.model.MediaFile;

public interface UploadMediaUseCase {
    MediaFile upload(UploadMediaCommand command);
}
