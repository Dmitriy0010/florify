package ru.florify.auth.adapter.in.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email format is invalid")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        String password,

        @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone must be a valid format (+79991234567)")
        String phone,

        String firstName,
        String lastName,
        String deviceInfo,
        String role
) {
    public RegisterRequest {
        if (deviceInfo == null) deviceInfo = "unknown";
    }
}
