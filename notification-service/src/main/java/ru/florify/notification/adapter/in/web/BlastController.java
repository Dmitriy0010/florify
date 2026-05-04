package ru.florify.notification.adapter.in.web;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.florify.notification.adapter.in.web.dto.SendBlastRequest;
import ru.florify.notification.application.command.SendBlastCommand;
import ru.florify.notification.application.port.in.SendBlastUseCase;

@RestController
@RequestMapping("/api/v1/notifications/blast")
@RequiredArgsConstructor
public class BlastController {

    private final SendBlastUseCase sendBlastUseCase;

    @PostMapping
    public SendBlastUseCase.BlastResult sendBlast(@RequestBody SendBlastRequest request) {
        SendBlastCommand command = new SendBlastCommand(
                request.recipientIds(),
                request.channel(),
                request.templateCode(),
                request.customSubject(),
                request.customBody(),
                request.variables()
        );
        return sendBlastUseCase.sendBlast(command);
    }
}
