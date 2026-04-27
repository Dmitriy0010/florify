package ru.florify.notification.adapter.in.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.florify.common.application.query.PagedResult;
import ru.florify.notification.adapter.in.web.dto.NotificationLogResponse;
import ru.florify.notification.adapter.in.web.mapper.NotificationWebMapper;
import ru.florify.notification.application.port.in.NotificationLogQueryUseCase;
import ru.florify.notification.application.query.NotificationLogSearchQuery;
import ru.florify.notification.domain.model.Channel;
import ru.florify.notification.domain.model.SendStatus;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications/logs")
@RequiredArgsConstructor
public class NotificationLogController {

    private final NotificationLogQueryUseCase logQueryUseCase;
    private final NotificationWebMapper mapper;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<NotificationLogResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toResponse(logQueryUseCase.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public ResponseEntity<PagedResult<NotificationLogResponse>> search(
            @RequestParam(required = false) UUID recipientId,
            @RequestParam(required = false) String templateCode,
            @RequestParam(required = false) Channel channel,
            @RequestParam(required = false) SendStatus status,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        var query = new NotificationLogSearchQuery(recipientId, templateCode, channel, status, from, to);
        var result = logQueryUseCase.search(query, page, size);
        return ResponseEntity.ok(new PagedResult<>(
                result.data().stream().map(mapper::toResponse).toList(),
                result.page(), result.size(), result.totalElements()
        ));
    }
}

