package ru.florify.auth.adapter.in.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.florify.auth.adapter.in.web.dto.LoginRequest;
import ru.florify.auth.adapter.in.web.dto.RegisterRequest;
import ru.florify.auth.adapter.in.web.dto.TokenResponse;
import ru.florify.auth.application.command.LoginUserCommand;
import ru.florify.auth.application.command.RegisterUserCommand;
import ru.florify.auth.application.service.JwtService;
import ru.florify.auth.application.port.in.LoginUserUseCase;
import ru.florify.auth.application.port.in.RegisterUserUseCase;
import ru.florify.auth.domain.model.User;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegisterUserUseCase registerUserUseCase;
    private final LoginUserUseCase loginUserUseCase;
    private final JwtService jwtService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public TokenResponse register(@Valid @RequestBody RegisterRequest request) {
        var command = new RegisterUserCommand(request.email(), request.password());
        User user = registerUserUseCase.execute(command);
        String token = jwtService.generateAccessToken(user);
        return new TokenResponse(token);
    }

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest request) {
        var command = new LoginUserCommand(request.email(), request.password());
        User user = loginUserUseCase.execute(command);
        String token = jwtService.generateAccessToken(user);
        return new TokenResponse(token);
    }
}
