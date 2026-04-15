package ru.florify.auth.adapter.in.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.florify.auth.adapter.in.web.dto.*;
import ru.florify.auth.adapter.in.web.mapper.AuthMapper;
import ru.florify.auth.adapter.in.web.mapper.UserWebMapper;
import ru.florify.auth.application.AuthTokensResult;
import ru.florify.auth.application.command.*;
import ru.florify.auth.application.port.in.*;
import ru.florify.auth.domain.model.User;
import ru.florify.common.security.UserPrincipal;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication and Authorization API")
public class AuthController {

    private final RegisterUserUseCase registerUserUseCase;
    private final LoginUserUseCase loginUserUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;
    private final LogoutUseCase logoutUseCase;
    private final GetCurrentUserUseCase getCurrentUserUseCase;
    private final AssignRoleUseCase assignRoleUseCase;
    private final ChangePasswordUseCase changePasswordUseCase;
    private final AuthMapper authMapper;
    private final UserWebMapper userMapper;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", responses = {
            @ApiResponse(responseCode = "201", description = "User registered successfully",
                    content = @Content(schema = @Schema(implementation = TokenResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "409", description = "Email or phone already taken")
    })
    public ResponseEntity<TokenResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("REST request to register user: {}", request.email());
        var command = new RegisterUserCommand(
                request.email(),
                request.password(),
                request.phone(),
                request.firstName(),
                request.lastName(),
                request.deviceInfo()
        );
        AuthTokensResult result = registerUserUseCase.execute(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(authMapper.toResponse(result));
    }

    @PostMapping("/login")
    @Operation(summary = "Login existing user", responses = {
            @ApiResponse(responseCode = "200", description = "Login successful",
                    content = @Content(schema = @Schema(implementation = TokenResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("REST request to login user: {}", request.email());
        var command = new LoginUserCommand(
                request.email(),
                request.password(),
                request.deviceInfo()
        );
        AuthTokensResult result = loginUserUseCase.execute(command);
        return ResponseEntity.ok(authMapper.toResponse(result));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", responses = {
            @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
            @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("REST request to refresh token");
        var command = new RefreshTokenCommand(
                request.refreshToken(),
                request.deviceInfo() != null ? request.deviceInfo() : "unknown"
        );
        AuthTokensResult result = refreshTokenUseCase.execute(command);
        return ResponseEntity.ok(authMapper.toResponse(result));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", responses = {
            @ApiResponse(responseCode = "204", description = "Logout successful"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> logout(
            @Valid @RequestBody RefreshTokenRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest
    ) {
        log.info("REST request to logout user: {}", principal.getUserId());
        String authHeader = servletRequest.getHeader("Authorization");
        String accessToken = (authHeader != null && authHeader.startsWith("Bearer ")) 
                ? authHeader.substring(7) 
                : null;

        var command = new LogoutCommand(
                accessToken,
                request.refreshToken(),
                principal.getUserId()
        );
        logoutUseCase.execute(command);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile", responses = {
            @ApiResponse(responseCode = "200", description = "Profile found",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        log.info("REST request to get current user: {}", principal.getUserId());
        User user = getCurrentUserUseCase.execute(principal.getUserId());
        return ResponseEntity.ok(userMapper.toResponse(user));
    }

    @PutMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Assign role to user (Owner only)", responses = {
            @ApiResponse(responseCode = "200", description = "Role assigned successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden (not an owner)"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserResponse> assignRole(
            @PathVariable UUID userId,
            @Valid @RequestBody AssignRoleRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        log.info("REST request to assign role {} to user {} by {}", request.role(), userId, principal.getUserId());
        var command = new AssignRoleCommand(
                userId,
                request.role(),
                principal.getUserId()
        );
        User updatedUser = assignRoleUseCase.execute(command);
        return ResponseEntity.ok(userMapper.toResponse(updatedUser));
    }

    @PutMapping("/password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Change current user password", description = "Updates password and invalidates all current sessions.", responses = {
            @ApiResponse(responseCode = "204", description = "Password changed successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized or incorrect current password")
    })
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest
    ) {
        log.info("REST request to change password for user: {}", principal.getUserId());
        String authHeader = servletRequest.getHeader("Authorization");
        String accessToken = (authHeader != null && authHeader.startsWith("Bearer "))
                ? authHeader.substring(7)
                : null;

        var command = new ChangePasswordCommand(
                principal.getUserId(),
                request.currentPassword(),
                request.newPassword(),
                accessToken
        );
        changePasswordUseCase.execute(command);
        return ResponseEntity.noContent().build();
    }
}
