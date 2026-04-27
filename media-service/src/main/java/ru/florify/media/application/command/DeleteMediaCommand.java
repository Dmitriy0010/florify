package ru.florify.media.application.command;

import java.util.UUID;

public record DeleteMediaCommand(
        UUID mediaFileId,
        UUID performerId
) {
}
