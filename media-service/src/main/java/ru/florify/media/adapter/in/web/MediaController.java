package ru.florify.media.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.florify.common.security.UserPrincipal;
import ru.florify.media.adapter.in.web.dto.MediaUploadResponse;
import ru.florify.media.adapter.in.web.mapper.MediaWebMapper;
import ru.florify.media.application.command.DeleteMediaCommand;
import ru.florify.media.application.command.UploadMediaCommand;
import ru.florify.media.application.port.in.DeleteMediaUseCase;
import ru.florify.media.application.port.in.GetMediaUrlUseCase;
import ru.florify.media.application.port.in.UploadMediaUseCase;
import ru.florify.media.domain.model.MediaFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
@Tag(name = "Media", description = "Media file management")
public class MediaController {

    private final UploadMediaUseCase uploadMediaUseCase;
    private final DeleteMediaUseCase deleteMediaUseCase;
    private final GetMediaUrlUseCase getMediaUrlUseCase;
    private final MediaWebMapper mapper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload media file")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'FLORIST', 'CASHIER')")
    public ResponseEntity<MediaUploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal
    ) throws IOException {
        UploadMediaCommand command = new UploadMediaCommand(
                file.getOriginalFilename(),
                file.getContentType(),
                file.getBytes(),
                principal.getUserId()
        );

        MediaFile mediaFile = uploadMediaUseCase.upload(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(toFullResponse(mediaFile));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get media stream (redirect to storage)")
    public ResponseEntity<Void> getUrl(
            @PathVariable UUID id
    ) {
        String url = getMediaUrlUseCase.getUrl(id);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(java.net.URI.create(url))
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete media file")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        deleteMediaUseCase.delete(new DeleteMediaCommand(id, principal.getUserId()));
        return ResponseEntity.noContent().build();
    }

    private MediaUploadResponse toFullResponse(MediaFile mediaFile) {
        var response = mapper.toResponse(mediaFile);
        String url = getMediaUrlUseCase.getUrl(mediaFile.getId());
        return new MediaUploadResponse(
                response.id(),
                response.originalFilename(),
                response.mimeType(),
                response.status(),
                url,
                response.uploadedAt()
        );
    }
}
